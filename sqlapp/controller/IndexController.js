IndexController = {}
const db = require("../db");
const fs = require("fs");
const utf8 = require("utf8");
const csv = require("neat-csv");
const { spawn } = require("child_process");
const Amazon = require("../model/Amazon");
const Shopee = require("../model/Shopee");
const Job = require("../model/Job");
const Pantip = require("../model/Pantip");
const Jd = require("../model/Jd");
const Facebook = require("../model/Facebook");
const Keyword = require("../model/Keyword");

IndexController.get = async (req, res) => {
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
        el.service = "shopee";
        break;
      case "2":
        el.service = "amazon";
        break;
      case "3":
        el.service = "pantip";
        break;
      case "4":
        el.service = "jd";
        break;
      case "5":
        el.service = "facebook"
    }
  });
  res.render("index", { title: "Job", name: "mac", objectJson: results });
  // res.json(results);
  // } catch (e) {
  //   console.log(e);
  //   res.sendStatus(500);
  // }
  // res.redirect("index");
}

IndexController.post = async (req, res) => {
    try {
        // let results = await db.add(req);
        // res.json(results);
        try {
          var dataToSend;
          // spawn new child process to call the python script
          const python = await spawn("python", [
            "C:/Users/LENOVO/Desktop/python/pythongetpostshopee/main.py",
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
            start_time: startTime,
          });
    
          let utfKeyword = encodeURI(keyword);
          //amazon
          python.stdin.write(`${service}\n` + page + "\n" + utfKeyword);
    
          python.stdin.end();
          // collect data from script
          python.stdout.on("data", function (data) {
            console.log("Pipe data from python script ...");
            dataToSend = data.toString();
            console.log(dataToSend);
          });
          // in close event we are sure that stream from child process is closed
          python.on("exit", async (code) => {
            const raw = fs.readFileSync("myfile.csv", "utf8");
            // console.log(`child process close all stdio with code ${code}`);
            // console.log("service:" + service);
    
            let i = 0;
            let job = new Job();
    
            //shopee
            if (service == 1) {
              //edit header
              const header = raw.split(/\r?\n/)[0].split(",");
              header[6] = "send_from";
              header[9] = "product_id";
              const result = await csv(raw, { headers: header });
              let shopeeObj = new Shopee();
              let lastOne = await job.getLastOne();
              console.log("outside loop");
              // console.log(result);
              result.forEach(async (value) => {
                // console.log("loop");
                delete value["num"];
                value["price"] = value["price"].substring(1, value["price"].length);
                if (i >= 1) {
                  //save to database
                  await shopeeObj.saveEcom(value, keyword);
                }
                i++;
              });
              //update job_id in table
              // console.log("outside loop");
              shopeeObj.updateJobId(lastOne[0].id);
              //amazon
            } else if (service == 2) {
              const header = raw.split(/\rsda\n/)[0].split(",");
              header[1] = "product_id";
              header[8] = "rank";
              const result = await csv(raw, { headers: header });
              let amazonObj = new Amazon();
              let lastOne = await job.getLastOne();
              result.forEach(async (value) => {
                // value["price"] = value["price"].substring(1, value["price"].length);
                delete value["num"];
                if (i >= 1) {
                  await amazonObj.save(value);
                }
                i++;
              });
              amazonObj.updateJobId(lastOne[0].id);
              //pantip
            } else if (service == 3) {
              let pantipObj = new Pantip();
              const header = raw.split(/\r?\n/)[0].split(",");
              header[5] = "like_count";
              header[6] = "emo_count";
              header[9] = "date_time";
              header[14] = "good_word";
              header[15] = "bad_word";
              const result = await csv(raw, { headers: header });
              let lastOne = await job.getLastOne();
              result.forEach(async (value) => {
                delete value["num"];
                if (i >= 1) {
                  // console.log(value);
                  await pantipObj.save(value);
                }
                i++;
              });
              pantipObj.updateJobId(lastOne[0].id);
            } else if (service == 4) {
              let jdObj = new Jd();
              const header = raw.split(/\r?\n/)[0].split(",");
              header[3] = "product_id";
              header[7] = "send_from";
              const result = await csv(raw, { headers: header });
              // console.log(result);
              // console.log(
              //   "-------------------------------------------------------result"
              // );
              let lastOne = await job.getLastOne();
              // console.log(lastOne);
              console.log("out loop");
              result.forEach(async (value) => {
                console.log("lopp");
                delete value["num"];
                if (i >= 1) {
                  console.log("ooooo");
                  await jdObj.save(value);
                }
                i++;
              });
    
              jdObj.updateJobId(lastOne[0].id);
            } else if (service == 5) {
              let facebookObj = new Facebook();
              const header = raw.split(/\r?\n/)[0].split(",");
              header[11] = "good_word";
              header[12] = "bad_word";
              let lastOne = await job.getLastOne();
              const result = await csv(raw, { headers: header });
              result.forEach(async (value) => {
                delete value["num"];
                if (i >= 1) {
                  // console.log(value);
                  await facebookObj.save(value)
                }
                i++;
              });
              facebookObj.updateJobId(lastOne[0].id);
            }
            const keywordDB = new Keyword()
            keywordDB.save({"word": keyword})
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
}

module.exports = IndexController