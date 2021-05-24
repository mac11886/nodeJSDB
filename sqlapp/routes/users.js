var express = require("express");
var router = express.Router();
const fs = require("fs");
const db = require("../db");
const csv = require("neat-csv");
const raw = fs.readFileSync("shopee-search.csv", "utf8");

/* GET users listing. */
router.get("/", async (req, res, next) => {
  // fs.readFile("shopee-search.csv", "utf-8", async (error, data) => {
  //   res.send(await data);
  //   console.log(data);
  // });
  // res.send('respond with a resource');
  const header = raw.split(/\r?\n/)[0].split(",");
  header[6] = "send_from";
  const result = await csv(raw, { headers: header });
  result.forEach(async (value) => {
    const sendTosql = value;
    delete sendTosql["num"];
    let results = await db.add(sendTosql);
  });
  // const sendTosql = result[1];

  res.send("OK");

  // readCSV();
});
// router.post("/add", async (req, res) => {W
//   try {
//     let results = await db.add(result);
//     res.json(results);
//   } catch (e) {
//     console.log(e);
//     res.sendStatus(500);
//   }
// });
module.exports = router;
