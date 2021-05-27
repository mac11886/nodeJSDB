var express = require("express");
var router = express.Router();
const db = require("../db");
const fs = require("fs");
const utf8 = require("utf8");
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
  results.forEach((el) => {
    let date = new Date(el.start_time); // Or the date you'd like converted.
    let isoDateTime = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    el.start_time = isoDateTime;
    let date2 = new Date(el.end_time); // Or the date you'd like converted.
    let isoDateTime2 = new Date(
      date2.getTime() - date2.getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    el.end_time = isoDateTime2;
    switch (el.service) {
      case "1":
        el.service = "Shopee";
        break;
      case "2":
        el.service = "Amazon";
        break;
      case "3":
        el.service = "Pantip";
        break;
      case "4":
        el.service = "JD";
    }
  });
  res.render("index", { title: "Job", name: "mac", objectJson: results });
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
      const python = await spawn("python", [
        "C:/Users/menin/Documents/python/python-ken/pythongetpostshopee/main.py",
      ]);
      //shopee
      let service = req.body.service;

      let keyword = req.body.keyword;
      let page = req.body.page;
      let startTime = req.body.startTime;

      let response = await db.addJob({
        keyword: keyword,
        service: service,
        page: page,
        status: "in progress",
        path_file: "path....",
        start_time: startTime,
      });

      let url = encodeURI(
        "https://shopee.co.th/search?keyword=" + utf8.encode(keyword)
      );
      let urlAma = encodeURI(
        "https://www.amazon.com/s?k=" + keyword + "&ref=nb_sb_noss_2"
      );
      let urlPantip = encodeURI("https://pantip.com/search?q=" + keyword);
      let utfKeyword = encodeURI(keyword);
      //amazon
      if (service == 2) {
        python.stdin.write("2\n" + page + "\n" + utfKeyword);
        python.stdin.end();
      }
      //shopee
      else if (service == 1) {
        python.stdin.write("1\n" + page + "\n" + utfKeyword);
        python.stdin.end();
      }
      // pantip
      else if (service == 3) {
        python.stdin.write("3\n" + page + "\n" + utfKeyword);
        python.stdin.end();
      } else if (service == 4) {
        python.stdin.write("4\n" + page + "\n" + utfKeyword);
        python.stdin.end();
      }
      console.log(utfKeyword);
      // collect data from script
      python.stdout.on("data", async function (data) {
        console.log("Pipe data from python script ...");
        dataToSend = data.toString();
        console.log(dataToSend);
        console.log("collect data");
      });
      // in close event we are sure that stream from child process is closed
      python.on("exit", async (code) => {
        const raw = fs.readFileSync("myfile.csv", "utf8");
        console.log("collect data on exit");
        console.log(`child process close all stdio with code ${code}`);
        console.log("service:" + service);
        if (service == 1) {
          const header = raw.split(/\r?\n/)[0].split(",");
          header[6] = "send_from";
          const result = await csv(raw, { headers: header });
          result.forEach(async (value) => {
            value["price"] = value["price"].substring(1, value["price"].length);
            const sendTosql = value;
            delete sendTosql["num"];
            await db.add(sendTosql);
          });
        } else if (service == 2) {
          const header = raw.split(/\r?\n/)[0].split(",");
          header[1] = "product_id";
          const result = await csv(raw, { headers: header });
          result.forEach(async (value) => {
            value["price"] = value["price"].substring(1, value["price"].length);
            const sendTosql = value;
            delete sendTosql["num"];
            await db.addAmazon(sendTosql);
          });
        } else if (service == 3) {
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
        } else if (service == 4) {
          const header = raw.split(/\r?\n/)[0].split(",");
          header[3] = "product_id";
          header[7] = "send_from";
          const result = await csv(raw, { headers: header });
          result.forEach(async (value) => {
            const sendTosql = value;
            delete sendTosql["num"];
            let results = await db.addJD(sendTosql);
          });
        }

        response = await db.updateJob(response.id);
        res.json(response);
        // const sendTosql = result[1];
      });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
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
