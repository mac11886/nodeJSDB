var express = require("express");
var router = express.Router();

const IndexController = require("../controller/IndexController");
const TestController = require("../controller/TestController");
const KeywordController = require("../controller/KeywordController");
const FacebookPageController = require("../controller/FacebookPageController");
const JobController = require("../controller/JobController");

let results = {};
/* GET home page. */

router.get("/", (req, res, next) => IndexController.get(req, res));
router.post("/post", (req, res) => IndexController.post(req, res));
router.get("/status", (req, res) => TestController.test(req, res));
router.get("/keyword", (req,res) => KeywordController.get(req,res));
router.get("/fillterkeyword", (req,res) => KeywordController.fillter(req,res));
router.get("/getKeywordByService", (req,res) => KeywordController.getKeywordByService(req,res));
router.post("/createkeyword", (req,res) => KeywordController.post(req,res));
router.post("/deletekeyword", (req,res) => KeywordController.delete(req,res));

router.get("/facebook_page", (req,res) => FacebookPageController.get(req,res));
router.post("/facebook_page/post", (req,res) => FacebookPageController.post(req,res));
router.post("/facebook_page/delete", (req,res) => FacebookPageController.delete(req,res));

router.get("/job", (req, res) => JobController.get(req, res));
router.get("/job/progress", (req, res) => JobController.progress(req, res));
router.post("/job/run", (req,res) => JobController.run(req,res));
router.post("/job/create", (req,res) => JobController.create(req,res));
router.post("/job/start", (req,res) => JobController.start(req,res));
router.post("/job/stop", (req,res) => JobController.stop(req,res));

router.post("/job/facebook", (req,res) => JobController.facebook(req,res));
router.post("/job/inside", (req, res) => JobController.getInside(req, res));



module.exports = router;
