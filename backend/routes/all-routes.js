//aggregates all routes for the application
const express = require("express");
const router = express.Router();

//import route files
const authRoutes = require("./auth-routes");
const postRoutes = require("./post-routes");
const userRoutes = require("./user-routes");
const imageRoutes = require("./image-routes");
const populatedbRoutee = require("./populatedb-route");
const linkPreviewRoutes = require("./link-preview-routes");

//use route modules
router.use("/", authRoutes);
router.use("/", postRoutes);
router.use("/", userRoutes);
router.use("/", imageRoutes);
router.use("/", populatedbRoutee);
router.use("/api", linkPreviewRoutes);

//basic route to check if API is working
router.get("/", (req, res) => {
  res.send("App is Working");
});

module.exports = router;