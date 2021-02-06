const express = require("express");

const modelderivativeRoutes = require("./modelderivative");
const temperatureRoutes = require("./temperature");
const ossRoutes = require("./oss");
const oauthRoutes = require("./oauth");
const userRoutes = require("./user");

let router = express.Router();

router.use("/api/v1/forge/modelderivative", modelderivativeRoutes);
router.use("/api/v1/forge/oss", ossRoutes);
router.use("/api/v1/forge/oauth", oauthRoutes);
router.use("/api/v1/db/temperature", temperatureRoutes);
router.use("/", userRoutes);

module.exports = router;
