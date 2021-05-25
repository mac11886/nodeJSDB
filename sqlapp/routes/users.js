var express = require("express");
var router = express.Router();
const fs = require("fs");
const db = require("../db");
const csv = require("neat-csv");
const { head } = require(".");
const rawShopee = fs.readFileSync("shopee-search.csv", "utf8");
const raw = fs.readFileSync("myfile.csv", "utf-8");
/* GET users listing. */
router.get("/", async (req, res, next) => {
  // fs.readFile("shopee-search.csv", "utf-8", async (error, data) => {
  //   res.send(await data);
  //   console.log(data);
  // });
  // res.send('respond with a resource');
  const header = rawShopee.split(/\r?\n/)[0].split(",");
  header[6] = "send_from";
  const result = await csv(rawShopee, { headers: header });
  result.forEach(async (value) => {
    value["price"] = value["price"].substring(1, value["price"].length);
    const sendTosql = value;
    delete sendTosql["num"];
    let results = await db.add(sendTosql);
  });
  // const sendTosql = result[1];

  res.send("OK");

  // readCSV();
});
router.get("/amazon", async (req, res) => {
  const header = raw.split(/\r?\n/)[0].split(",");
  header[1] = "product_id";
  const result = await csv(raw, { headers: header });
  result.forEach(async (value) => {
    value["price"] = value["price"].substring(1, value["price"].length);
    const sendTosql = value;
    delete sendTosql["num"];
    let results = await db.addAmazon(sendTosql);
    res.send("OK");
  });
});

router.get("/pantip", async (req, res) => {
  const header = raw.split(/\r?\n/)[0].split(",");
  header[5] = "like_count";
  header[6] = "emo_count";
  header[9] = "date_time";
  const result = await csv(raw, { headers: header });
  result.forEach(async (value) => {
    const sendTosql = value;
    delete sendTosql["num"];
    let results = await db.addPantip(sendTosql);
  });
  res.send("OK");
});
router.get("/date", (req, res) => {
  const date = new Date().toLocaleString("en-US", { timeZone: "Asia/Bangkok" });

  res.send(date);
});

function convertTZ(date, tzString) {
  return new Date(
    (typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {
      timeZone: tzString,
    })
  );
}
module.exports = router;
