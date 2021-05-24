var express = require("express");
var router = express.Router();
const db = require("../db");
const fs = require("fs");
const csv = require("neat-csv");
const { spawn } = require("child_process");

let results = {};
/* GET home page. */
router.get("/", async (req, res, next) => {
  // try {
  //   var dataToSend;
  //   // spawn new child process to call the python script
  //   const python = spawn("python", [
  //     "C:/Users/menin/Documents/python/pythongetpostshopee-main/pythongetpostshopee-main/main.py",
  //   ]);

  //   python.stdin.write("2\n1\nhttps://www.amazon.com/s?k=car&ref=nb_sb_noss_2");
  //   python.stdin.end();

  //   // collect data from script
  //   python.stdout.on("data", function (data) {
  //     console.log("Pipe data from python script ...");
  //     dataToSend = data.toString();
  //   });
  //   // in close event we are sure that stream from child process is closed
  //   python.on("exit", (code) => {
  //     console.log(`child process close all stdio with code ${code}`);
  //     // send data to browser
  //     res.send("success");
  //   });
  results = await db.all();
  res.render("index", { title: "Express", name: "mac", objectJson: results });
  // res.json(results);
  // } catch (e) {
  //   console.log(e);
  //   res.sendStatus(500);
  // }
  // res.redirect("index");
});
router.post("/post", async (req, res) => {
  try {
    // let results = await db.add(req);
    // res.json(results);
    try {
      var dataToSend;
      // spawn new child process to call the python script
      const python = spawn("python", [
        "C:/Users/menin/Documents/python/python-ken/pythongetpostshopee/main.py",
      ]);
      //shopee
      let service = req.body.service;
      let keyword = req.body.keyword;
      let page = req.body.page;
      let url = encodeURI("https://shopee.co.th/search?keyword=" + keyword);
      let urlAma = encodeURI(
        "https://www.amazon.com/s?k=" + keyword + "&ref=nb_sb_noss"
      );
      let urlPantip = encodeURI("https://pantip.com/search?q=" + keyword);
      if (service == 2) {
        python.stdin.write("2\n" + page + "\n" + urlAma);
        python.stdin.end();
      }
      //amazon
      else if (service == 1) {
        python.stdin.write("1\n" + page + "\n" + url);

        python.stdin.end();
      } else if (service == 3) {
        python.stdin.write("3\n" + page + "\n" + urlPantip);
      }

      // collect data from script
      python.stdout.on("data", async function (data) {
        console.log("Pipe data from python script ...");
        dataToSend = data.toString();
        const rawShopee = fs.readFileSync("myfile.csv", "utf8");

        const header = rawShopee.split(/\r?\n/)[0].split(",");
        header[6] = "send_from";
        const result = await csv(rawShopee, { headers: header });
        result.forEach(async (value) => {
          value["price"] = value["price"].substring(1, value["price"].length);
          const sendTosql = value;
          delete sendTosql["num"];
          let results = await db.add(sendTosql);
        });
      });
      // in close event we are sure that stream from child process is closed
      python.on("exit", (code) => {
        console.log(`child process close all stdio with code ${code}`);
        // send data to browser
        // res.send("success");
      });
      // results = await db.all();
      // res.render("index", {
      //   title: "Express",
      //   name: "mac",
      //   objectJson: results,
      // });
      // res.json(results);

      // res.send(result);
      // let results = await db.add(result);
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
    // res.redirect("index");
    res.redirect("/");
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

router.get("/getAll", async (req, res, next) => {});
router.post("/add", async (req, res) => {
  try {
    let results = await db.add(req);
    res.json(results);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});
module.exports = router;
