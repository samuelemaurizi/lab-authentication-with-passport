const express = require("express");
const router = express.Router();

// Global User variable for all routers
router.get("*", (req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

module.exports = router;
