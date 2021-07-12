IndexController = {}
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
const { resolve } = require("path");
const { rejects } = require("assert");
const Service = require("../model/Service");
const Facebook_page = require("../model/Facebook_page");
const Model = require("../model/Model");
const dotenv = require("dotenv")



async function getData(service, keyword, page) {
  return new Promise(function (resolve, reject) {
    try {
      let utfKeyword = encodeURI(keyword);
      python = spawn(process.env.PYTHON_PATH, [
        process.env.SCRAPE_PATH
      ]);
      // console.log("get pythonnnnnnnnnnrsnnnnnnn",service,page,keyword)
      python.stdin.write(`${service}\n` + page + "\n" + utfKeyword);
      python.stdin.end();
      python.stdout.on("data", function (data) {
        console.log("Pipe data from python script ...");
        dataToSend = data.toString();
        console.log(dataToSend);
      });
  
      // in close event we are sure that stream from child process is closed
      python.on("exit", async (code) => {
        console.log('on exit')
        const raw = fs.readFileSync(process.env.FILE, "utf8");
        console.log(`child process close all stdio with code ${code}`);
        // console.log("service:" + service);
  
        let i = 0;
        let obj
        let job = new Job();
        let model = new Model();
        let pk_id = ""
        model.connect()
  
        if (service == 1) {
          obj = new Shopee();
          pk_id = "product_id"
        }
        else if (service == 2) {
          obj = new Amazon();
          pk_id = "product_id"
        }
        else if (service == 3) {
          obj = new Pantip();
          pk_id="post_id"
        }
        else if (service == 4) {
          obj = new Jd();
          pk_id = "product_id"
        }
        else if (service == 5) {
          obj = new Facebook();
          pk_id="post_id"
        }
        
        const header = raw.split(/\r?\n/)[0].split(",");
        try {
          result = await csv(raw, { headers: header });
        }
        catch (err) {
          console.log(err, "error result")
          return;
        }
        try {
          lastOne = await job.getLastOne();
        } catch (err) {
          console.log(err, 'error lastOne')
          return;
        }
  
        for await (const value of result) {
          delete value["num"];
          try {
            if (i >= 1) {
              obj.check_product(value[pk_id])
                .then(async (check) => {
                  console.log("found =", check)
                  if (check > 0) {
                    await obj.update_product(value).then(() => {
                      obj.updateJobId(lastOne[0].id);
                    })
                  } else {
                    await obj.saveEcom(value, keyword).then(() => {
                      obj.updateJobId(lastOne[0].id);
                    })
                  }
                });
            }
          } catch (error) {
            console.log(error.message, 'error ', value, keyword)
          }
          i++;
        } resolve()
        
      });
    } catch (err) {
      console.log("get data", err)
  
    }
  });
  
  }

IndexController.get = async (req, res) => {
  const model = new Model()
  model.connect()
  results = await model.all();
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
  let keywords = await new Keyword().get()
  let services = await new Service().get()
  let facebook_pages = await new Facebook_page().get()

  res.json({ results, keywords, services, facebook_pages });

}

IndexController.post = async (req, res) => {
  try {
    try {
      // spawn new child process to call the python script
      let model = new Model()
      let service = req.body.service;
      let keyword = req.body.keyword;
      console.log("keywootrrrrr", keyword)
      let page = req.body.page;
      let date = new Date(); // Or the date you'd like converted.
      let startTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ');

      let response = await model.addJob({
        keyword: keyword.toString(),
        service: service,
        page: page,
        status: "in progress",
        start_time: startTime,
      });
          if(typeof(keyword) == "object"){
            
            let resolve = getData(service,keyword[0],page);
            resolve.then(() => {
              let result = getData(service,keyword[1],page);
            result.then(async() => {
              // model.connect()
              response =  await model.updateJob(response.id,"success");
              res.json(response);
              console.log("-----------DONE--------------")
              });
            });
          }else{
            let resolve = getData(service,keyword,page);
            resolve.then(async() => {
              response =  await model.updateJob(response.id,"success");
              res.json(response);
              console.log("-----------DONE--------------")
              });
          }
          
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