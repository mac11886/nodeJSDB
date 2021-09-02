var express = require("express");
var router = express.Router();

const KeywordController = require("../controller/KeywordController");
const FacebookPageController = require("../controller/FacebookPageController");
const JobController = require("../controller/JobController");
const FacebookController = require("../controller/FacebookController")
let results = {};
/* GET home page. */


router.get("/keyword", (req,res) => KeywordController.get(req,res)); //get all keyword
router.get("/fillterkeyword", (req,res) => KeywordController.fillter(req,res));
router.get("/getKeywordByService", (req,res) => KeywordController.getKeywordByService(req,res));
router.post("/createkeyword", (req,res) => KeywordController.post(req,res));
router.post("/deletekeyword", (req, res) => KeywordController.delete(req, res));
router.get("/add/all/keyword", (req,res) => KeywordController.addAll(req,res));

router.get("/facebook_page", (req,res) => FacebookPageController.get(req,res)); //get facebook page
router.post("/facebook_page/post", (req,res) => FacebookPageController.post(req,res));
router.post("/facebook_page/delete", (req,res) => FacebookPageController.delete(req,res));

router.get("/job", (req, res) => JobController.get(req, res));
router.get("/job/progress", (req, res) => JobController.progress(req, res)); //get all job progress
router.post("/job/run", (req,res) => JobController.run(req,res)); //run all job
router.post("/job/create", (req,res) => JobController.create(req,res)); //create job without facebook
router.post("/job/start", (req,res) => JobController.start(req,res)); // for cron job
router.post("/job/stop", (req,res) => JobController.stop(req,res)); // for cron job

router.post("/job/facebook/rework", (req,res) => JobController.facebook(req,res)); //for set word for facebook in db
router.post("/job/inside", (req, res) => JobController.getInside(req, res)); //get inside shopee or amazon
router.post("/job/create/facebook", (req, res) => JobController.facebookCreateJob(req, res)); //create faccebook job
router.get("/job/facebook", (req, res) => JobController.getFacebookJob(req, res)); //get facebook job
router.post("/job/run/facebook", (req, res) => JobController.runFacebook(req, res)); //run facebook job




module.exports = router;
