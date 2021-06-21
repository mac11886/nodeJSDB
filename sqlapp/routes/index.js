var express = require("express");
var router = express.Router();

const IndexController = require("../controller/IndexController");
const TestController = require("../controller/TestController");
const KeywordController =require("../controller/KeywordController");

let results = {};


router.get("/", (req, res, next) => IndexController.get(req, res));
router.post("/post", (req, res) => IndexController.post(req, res));

router.get("/status", (req, res) => TestController.test(req, res));

router.get("/keyword" , (req, res, next) => KeywordController.get(req, res));
router.post("/keyword/post", (req, res) => KeywordController.post(req, res));

module.exports = router;
