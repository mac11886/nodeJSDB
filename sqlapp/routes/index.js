var express = require("express");
var router = express.Router();

const IndexController = require("../controller/IndexController");
const TestController = require("../controller/TestController");
// const Facebook = require("../model/Facebook");
let results = {};
/* GET home page. */

router.get("/", (req, res, next) => IndexController.get(req, res));
router.get("/post", (req, res) => IndexController.post(req, res));

router.get("/status", (req, res) => TestController.test(req, res));
module.exports = router;
