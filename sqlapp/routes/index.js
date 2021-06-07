var express = require("express");
var router = express.Router();

const IndexController = require("../controller/IndexController");
const TestController = require("../controller/TestController");
// const Facebook = require("../model/Facebook");
let results = {};
/* GET home page. */
router.get("/", (req, res, next) => IndexController.get(req, res));
router.post("/post", (req, res) => IndexController.post(req, res));

// router.get("/getAll", async (req, res, next) => {});
// router.post("/add", async (req, res) => {
//   try {
//     let results = await db.add(req);
//     res.json(results);
//   } catch (e) {
//     console.log(e);
//     res.sendStatus(500);
//   }
// });

router.get("/status", (req, res) => TestController.test(req, res));
module.exports = router;
