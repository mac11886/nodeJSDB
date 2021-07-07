const Job = require("../model/Job");
const Keyword = require("../model/Keyword");
const Model = require("../model/model");
const Service = require("../model/Service");
const fs = require("fs");
const utf8 = require("utf8");
const csv = require("neat-csv");
const { spawn } = require("child_process");
const Amazon = require("../model/Amazon");
const Shopee = require("../model/Shopee");
const Pantip = require("../model/Pantip");
const Jd = require("../model/Jd");
const Facebook = require("../model/Facebook");
const { resolve } = require("path");
const { rejects } = require("assert");
const Facebook_page = require("../model/Facebook_page");


JobController = {}

JobController.run = async(req,res) => {
    let model = new Model();
    let all_job = Object.values(JSON.parse(JSON.stringify(await new Job().where(`status = "waiting"`))));

    
    for(const job of all_job){
      await model.updateJob(job.id,"in_progress")
      await getData(job.service,job.keyword,job.page,job.id)
      await model.updateJob(job.id,"success")
    }

    console.log("doneeeeeeeeeeeeee")
    res.json("run succ")
    

    
};

JobController.create = async(req,res) => {
    let all_keyword = Object.values(JSON.parse(JSON.stringify(await new Keyword().get())));
    let all_facebook_page = Object.values(JSON.parse(JSON.stringify(await new Facebook_page().get())));
    console.log(all_facebook_page)
    let date = new Date();
    let created_time = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ');

    for (const keyword of all_keyword){
        await KeywordMatchingWithService(keyword.thai_word,keyword.eng_word,created_time) 
    }

    await FacebookPageMatchingWithFacebook(all_facebook_page,created_time)

    res.json("succc")

};

function KeywordMatchingWithService(thai_word,eng_word,created_time){
    return new Promise (async(resolve) =>{
    let model = new Model();
    const services = Object.values(JSON.parse(JSON.stringify(await new Service().where(`not name = "facebook"`))))
    let page = 10 //----------->> actually is 100 <<----------------
    
    for (let service of services){
        if(service.name === "pantip"){
            page = 100 //----------->> actually is 1000 <<---------------------
        }
        let job_thai = {service: service.id,keyword: thai_word,status: "waiting",created_time: created_time,page: page}
        await model.addJob(job_thai)
        let job_eng = {service: service.id,keyword: eng_word,status: "waiting",created_time: created_time,page: page}
        await model.addJob(job_eng)
        page = 10
        }
        resolve()    
    })
}

function FacebookPageMatchingWithFacebook(all_facebook_page,created_time){
  return new Promise (async(resolve) => {
    let model = new Model();
    
    for (let facebook_page of all_facebook_page){
      let job = {service: 5,keyword: facebook_page.name,status: "waiting",created_time: created_time,page:100}
      await model.addJob(job)
    }
    resolve()
  })
}




function  getData (service,keyword,page){
    return new Promise(function(resolve,reject){
    try{
    
    
    let utfKeyword = encodeURI(keyword);
      python = spawn("/usr/local/bin/python3.8", [
        "/Users/mcmxcix/nodeJSDB/pythongetpostshopee1/main.py",
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
                    let check = await shopeeObj.check_product(value["product_id"] );
                    console.log("found =",check)
                    if (check > 0){
                      await shopeeObj.update_product(value)
                    } else{
                      await shopeeObj.saveEcom(value, keyword)
                    }
                  } 
                }catch (error) {
                  console.log(error.message, 'error ', value, keyword)
                }  
                  i++;
              }
              try{
                await shopeeObj.updateJobId(lastOne[0].id)
              }catch(error){
                console.log(error,"error update job")
              }
              resolve()
            }
                //amazon
               else if (service == 2) {
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
                          await amazonObj.update_product(value)
                        } else{
                          await amazonObj.saveEcom(value, keyword)
                      }
                      } 
                    }catch (error) {
                        console.log(error.message, 'error ', value, keyword)
                    }
                  i++;
                }
                try{
                  await amazonObj.updateJobId(lastOne[0].id);
                }catch(error){
                  console.log(error,"error update job")
                }
                resolve()
         
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
                        await pantipObj.update_product(value)
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
                        await jdObj.update_product(value)
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
                        await facebookObj.update_product(value)
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





module.exports = JobController ;