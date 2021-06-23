var express = require("express");
var router = express.Router();

const IndexController = require("../controller/IndexController");
const TestController = require("../controller/TestController");
const KeywordController =require("../controller/KeywordController");
const FacebookPageController = require("../controller/FacebookPageController");

let results = {};


router.get("/", (req, res, next) => IndexController.get(req, res));
router.post("/post", (req, res) => IndexController.post(req, res));

router.get("/status", (req, res) => TestController.test(req, res));

router.get("/keyword", (req,res) => KeywordController.get(req,res));
router.get("/fillterkeyword", (req,res) => KeywordController.fillter(req,res));
router.get("/getKeywordByService", (req,res) => KeywordController.getKeywordByService(req,res));
router.post("/createkeyword", (req,res) => KeywordController.post(req,res));
router.post("/deletekeyword", (req,res) => KeywordController.delete(req,res));

router.get("/facebook_page",(req, res) => FacebookPageController.get(req, res));
router.post("/facebook_page/post", (req, res) => FacebookPageController.post(req, res));
router.post("/facebook_page/delete", (req, res) => FacebookPageController.delete(req, res));

module.exports = router;
