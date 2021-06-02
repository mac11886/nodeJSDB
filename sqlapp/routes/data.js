var express = require("express");
var router = express.Router();
const fs = require("fs");
const db = require("../db");

router.get("/", (req, res, next) => {
  res.render("data", { title: "DATA", name: "mac", objectJson: value });
  // res.redirect("/");
});
module.exports = router;
