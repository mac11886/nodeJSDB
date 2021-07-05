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
const Service =require("../model/Service");
const Facebook_page = require("../model/Facebook_page");
const Model = require("../model/Model");


async function  getData (service,keyword,page){
  return new Promise(function(resolve,reject){
  try{

  
  let utfKeyword = encodeURI(keyword);
    python = spawn("python", [
      "C:\\Users\\Administrator\\Desktop\\pythongetpostshopee\\main.py",
    ]);
       
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
            let model = new Model();
            let shopeeObj = new Shopee();
            let amazonObj = new Amazon();
            model.connect()
            
            //shopee
            if (service == 1) {
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
              try{
              lastOne = await job.getLastOne();
              }catch(err) {
                console.log(err, 'error lastOne')
                return;
              }
      
              for await(const value of result) {
                delete value["num"];
              try {  
                if (i >= 1) {
                  shopeeObj.check_product(value["product_id"],"product_id" )
                  .then(async(check) => {
                  console.log("found =",check)

                  if (check > 0){
                    await shopeeObj.update_product(value,"product_id").then(() => {
                      shopeeObj.updateJobId(lastOne[0].id);
                    })
                  } else{
                    await shopeeObj.saveEcom(value, keyword).then(() => {
                      shopeeObj.updateJobId(lastOne[0].id);
                    })
                  }
                });
                  } 
                }catch (error) {
                    console.log(error.message, 'error ', value, keyword)
                }  
                i++;
            }resolve()

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
              try {
                 lastOne = await job.getLastOne();

              } catch(error) {
                console.log(error, 'error lastOne')
                return;
              }

              for (const value of result) {  
                delete value["num"];
                try {  
                  if (i >= 1) {
                    
                      let check = await amazonObj.check_product(value["product_id"],"product_id" );
                      console.log("found =",check)
                      if (check > 0){
                        await amazonObj.update_product(value,"product_id")
                      } else{
                        await amazonObj.saveEcom(value, keyword);
                    }
                    } 
                  }catch (error) {
                      console.log(error.message, 'error ', value, keyword)
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
              model.connect()
              for(const value of result){
                delete value["num"];
                try{
                if (i >= 1) {
                  let check = await pantipObj.check_product(value["post_id"],"post_id" );
                    console.log("found =",check)
                    if (check > 0){
                      await pantipObj.update_product(value,"post_id")
                    } else{
                      await pantipObj.saveEcom(value, keyword);
                    }
                    } 
                  }catch (error) {
                      console.log(error.message, 'error ', value, keyword)
                  }
                i++;
              }
              try{
                await pantipObj.updateJobId(lastOne[0].id);
              }catch(error){
                console.log(error,'error update job')
              }
              resolve()
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
                try{
                if (i >= 1) {
                  let check = await jdObj.check_product(value["product_id"],"product_id" );
                    console.log("found =",check)
                    if (check > 0){
                      await jdObj.update_product(value,"product_id")
                    } else{
                      await jdObj.saveEcom(value, keyword);
                    }
                    //save to database
                    } 
                  }catch (error) {
                      console.log(error.message, 'error ', value, keyword)
                  }
                i++;
              }
              try{
                jdObj.updateJobId(lastOne[0].id);
              }catch(error){
                console.log(error,'error update job')
              }resolve()
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
              for await(const value of result){
                delete value["num"];
                try{
                if (i >= 1) {
                  let check = await facebookObj.check_product(value["post_id"],"post_id");
                    console.log("found =",check)
                    if (check > 0){
                      await facebookObj.update_product(value,"post_id")
                    } else{
                      await facebookObj.saveEcom(value, keyword);
                    }
                    //save to database
                    } 
                  }catch (error) {
                      console.log(error.message, 'error ', value, keyword)
                  }
                i++;
              }
              try{
                facebookObj.updateJobId(lastOne[0].id);
              }catch(error){
                console.log(error,'error update job')
              }
              resolve()
            }
            // resolve()
          });
  }catch(err){
    if(err.code == "PROTOCOL_CONNECTION_LOST"){
      const model = new Model()
      model.connect()
    }else{
      console.log("get data",err)
    }

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

  res.json( {results,keywords,services,facebook_pages} );

}

IndexController.post = async (req, res) => {
    try {     
        try {
          // spawn new child process to call the python script
          let model = new Model()
          let service = req.body.service;
          let keyword = req.body.keyword;
          console.log("keywootrrrrr",req.body)
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
              response =  await model.updateJob(response.id);
              res.json(response);
              console.log("-----------DONE--------------")
              });
            });
          }else{
            let resolve = getData(service,keyword,page);
            resolve.then(async() => {
              response =  await model.updateJob(response.id);
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