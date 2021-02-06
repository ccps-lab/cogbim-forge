const express = require("express");
const passport = require("passport");
// const jwt = require("jsonwebtoken");

let router = express.Router();

//router.post(
//  "/signup",
//  passport.authenticate("signup", { session: false }),
//  async (req, res, next) => {
//    res.json({
//      message: "Signup Successfull",
//      user: req.user,
//    });
//  }
//);

//router.post(
//    "/login",
//    async (req, res, next) => {
//  passport.authenticate(
//    "login",
//{
//successRedirect: "/",
// failureRedirect: "/login",
//failureFlash: true,
//}
//     async (err, user, info) => {
//      try {
//         if (err || !user) {
//          const error = new Error("An error occurred.");
//
//          return next(error);
//        }
// res.redirect('/')
// req.login(user, { session: false }, async (error) => {
//   if (error) return next(error);

//   const body = { _id: user._id, email: user.email };
//   const token = jwt.sign({ user: body }, "TOP_SECRET");

//   return res.json({ token });
// });
//       } catch (error) {
//         return next(error);
//       }
//    }
//  )(req, res, next);
//}, async (req, res, next) => {
//    res.json({
//      message: "Login Successfull",
//      user: req.user,
//    });
//  });

router.post(
  "/login",
  passport.authenticate("login"),
  async (req, res, next) => {
    res.json({
      message: "Login Successfull",
    });
  }
);

module.exports = router;
