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
const { resolve } = require("path");
const { rejects } = require("assert");

IndexController.get = async (req, res) => {
 
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
  // res.render("index.pug", { objectJson: results });
  // res.render({  results });
  // return results;
  res.json( results );

}

IndexController.post = async (req, res) => {
    try {
      
        try {
          var dataToSend;
          // spawn new child process to call the python script
          const python = spawn("python", [
            "C:/Users/Bell/intern/nodeJSDB/pythongetpostshopee1/main.py",
          ]);

          
          let service = req.body.service;
          let keyword = req.body.keyword;
          let page = req.body.page;
          // let startTime = req.body.startTime;
          let date = new Date(); // Or the date you'd like converted.
          let startTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ');
    
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
          
          python.stdout.on("data", function (data) {
            console.log("Pipe data from python script ...");
            dataToSend = data.toString();
            console.log(dataToSend);
          });

          
          // in close event we are sure that stream from child process is closed
          python.on("exit", async (code) => {
            console.log('on exit')
            const raw = fs.readFileSync("myfile.csv", "utf8");
            console.log(`child process close all stdio with code ${code}`);
            console.log("service:" + service);
    
            let i = 0;
            let job = new Job();
    
            //shopee
            if (service == 1) {
              // console.log("service = 1")
              //edit header
              const header = raw.split(/\r?\n/)[0].split(",");
              header[6] = "send_from";
              header[9] = "product_id";
              try{
                result = await csv(raw, { headers: header });
              }
              catch (err){
                console.log(err,"error result")
                return;
              }
              let shopeeObj = new Shopee();
              try{
              lastOne = await job.getLastOne();
              }catch(err) {
                console.log(err, 'error lastOne')
                return;
              }
      
              for (const value of result) {
                delete value["num"];
                if (i >= 1) {
                  //save to database
                  try {
                   await shopeeObj.saveEcom(value, keyword);
                    
                  } catch (error) {
                    console.log(error.message, 'error ', value, keyword)
                  }
                  
                }
                i++;
              }
              try {
                shopeeObj.updateJobId(lastOne[0].id);

              } catch(err) {
                console.log('error update job')
              }


              //amazon
            } else if (service == 2) {
              const header = raw.split(/\rsda\n/)[0].split(",");
              header[1] = "product_id";
              header[8] = "rank";
              try {
                 result = await csv(raw, { headers: header });
              } catch(error) {
                console.log(error, 'error result')
                return;
              }
              let amazonObj = new Amazon();
              try {
                 lastOne = await job.getLastOne();

              } catch(error) {
                console.log(error, 'error lastOne')
                return;
              }

              for (const value of result) {  
                delete value["num"];
                if (i >= 1) {
                    try {
                      await amazonObj.saveEcom(value, keyword);
                    } 
                    catch(error) {
                      console.log(error.message, 'error ', value, keyword)
                    }       
                }
                i++;
              }
              try{ 
                amazonObj.updateJobId(lastOne[0].id)
              }catch(error) {
                console.log(error,'error update job')
              }

              //pantip
            } else if (service == 3) {
              let pantipObj = new Pantip();
              const header = raw.split(/\r?\n/)[0].split(",");
              header[5] = "like_count";
              header[6] = "emo_count";
              header[9] = "date_time";
              header[14] = "good_word";
              header[15] = "bad_word";
              try{
                result = await csv(raw, { headers: header });
              }catch(error){
                console.log(error, 'error result')
                return;
              }

              try{
                lastOne = await job.getLastOne();
              }catch(error){
                console.log(error, 'error lastOne')
                return;
              }

              for(const value of result){
                // console.log(result)
                delete value["num"];
                if (i >= 1) {
                  try{
                    await pantipObj.saveEcom(value,keyword);
                  }catch(error){
                    console.log(error.message, 'error ', value, keyword)
                  }
                }
                i++;
              }
              try{
                pantipObj.updateJobId(lastOne[0].id);
              }catch(error){
                console.log(error,'error update job')
              }
            } 

            //JD
            else if (service == 4) {
              let jdObj = new Jd();
              const header = raw.split(/\r?\n/)[0].split(",");
              header[2] = "product_id";
              header[7] = "send_from";
              try{
                result = await csv(raw, { headers: header });
              }catch(error){
                console.log(error,'error result')
                return;
              }
              try{
                lastOne = await job.getLastOne();
              }catch(error){
                console.log(error, 'error lastOne')
                return;
              }
              // console.log(lastOne);
              for (const value of result) {
                delete value["num"];
                if (i >= 1) {
                  try{
                    await jdObj.saveEcom(value,keyword);
                  }
                  catch(error){
                    console.log(error.message, 'error ', value, keyword)
                  }
                }
                i++;
              }
              try{
                jdObj.updateJobId(lastOne[0].id);
              }catch(error){
                console.log(error,'error update job')
                
              }

            //facebook
            } else if (service == 5) {
              let facebookObj = new Facebook();
              const header = raw.split(/\r?\n/)[0].split(",");
              header[11] = "good_word";
              header[12] = "bad_word";
              
              try{
                lastOne = await job.getLastOne();
              }catch(error){
                console.log(error, 'error lastOne')
                return;
              }

              try{
                result = await csv(raw, { headers: header });
              }catch(error){
                console.log(error, 'error lastOne')
                return;
              }
              for(const value of result){
                delete value["num"];
                if (i >= 1) {
                  try{
                    await facebookObj.saveEcom(value,keyword)
                  }catch(error){
                    console.log(error.message, 'error ', value, keyword)
                  }
                }
                i++;
              }
              try{
                facebookObj.updateJobId(lastOne[0].id);
              }catch(error){
                console.log(error,'error update job')
              }
            }
            const keywordDB = new Keyword()
            // keywordDB.save({"word": keyword})
            response = await db.updateJob(response.id);
            res.json(response);
            // const sendTosql = result[1];
          }); 

          // collect data from script
          
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