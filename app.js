const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const bodyParser = require("body-parser");
const session = require("express-session");
// const flash = require("express-flash");
// const methodOverride = require('method-override')

const sassMiddleware = require("node-sass-middleware");

const Temperature = require("./models/temperatures");
const User = require("./models/user");

require("dotenv").config();
require("./auth/auth");

// Router
const indexRouter = require("./routes/router");

const PORT = process.env.PORT || 3000;
const config = require("./config/config");

if (
  config.credentials.client_id == null ||
  config.credentials.client_secret == null ||
  config.db.uri == null
) {
  console.error(
    "Missing FORGE_CLIENT_ID or FORGE_CLIENT_SECRET or MONGO_URI env. variables."
  );
  return;
}

// Express REST API
let app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

// Sass middleware
app.use(
  sassMiddleware({
    /* Options */
    src: path.join(__dirname, "scss"),
    dest: path.join(__dirname, "public/assets/css"),
    debug: true,
    watchFiles: true,
    outputStyle: "compressed",
    prefix: "/assets/css", // Where prefix is at <link rel="stylesheets" href="prefix/style.css"/>
  })
);

app.use("/assets", express.static(path.join(__dirname, "/public/assets")));
// app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(flash());

const sessionExpiresIn = 1800000;
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: sessionExpiresIn,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
// app.use(methodOverride('_method'))

app.use("/", indexRouter);

// Route to Homepage
app.get("/", checkAuthenticated, (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Route to Login Page
app.get("/login", checkNotAuthenticated, (req, res) => {
  res.sendFile(__dirname + "/public/login.html");
});

app.delete("/logout", (req, res) => {
  req.logOut();
  res.redirect("/login");
});

// Check Authentication
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

// Plug in the JWT strategy as a middleware so only verified users can access this route.
// app.use("/user", passport.authenticate("jwt", { session: false }), secureRoute);

// Express Error Handlers
app.use((err, req, res, next) => {
  next();
  console.error(err);
  res.status(err.statusCode).json(err);
});

// Socket.io Setting
io.on("connection", function () {
  io.set("transports", ["websocket", "xhr-polling"]);
  console.log("A connection to Socket has been established.");
});

// mongoose.connect(config.db.uri, { useNewUrlParser: true });
mongoose.connect(config.db.uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.set("useCreateIndex", true);
const db = mongoose.connection;
mongoose.Promise = global.Promise;

db.on("error", console.error.bind(console, "Connection Error:"));

db.once("open", () => {
  http.listen(PORT, () => {
    console.log(`Node server running on port ${PORT}`);
  });

  const temperatureCollection = db.collection("temperatures");
  const changeStream = temperatureCollection.watch();

  changeStream.on("change", (change) => {
    // console.log(change);

    if (change.operationType === "insert") {
      const temperature = change.fullDocument;
      io.emit("SensorStream", {
        id: temperature._id,
        sensor_id: temperature.sensor_id,
        sensor_room: temperature.sensor_room,
        temperature: temperature.temperature,
      });
    } else if (change.operationType === "delete") {
      io.emit("sensorDataDeleted", change.documentKey._id);
    }
  });
});

function between(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
function FakeData() {
  Temperature.estimatedDocumentCount(function (err, count) {
    if (err) {
      console.log(err);
    } else {
      // console.log("Estimated Count :", count);
      if (count >= 2000) {
        Temperature.deleteMany({})
          .then(function () {
            // console.log("Data deleted"); // Success
          })
          .catch(function (error) {
            console.log(error); // Failure
          });
      }
    }
  });
  db.collection("temperatures").insertOne({
    sensor_id: "TEMP01",
    sensor_room: "Room - A",
    temperature: between(6, 32),
  });
}

var insertFake = setInterval(FakeData, 2000);
