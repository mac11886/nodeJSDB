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
var cron = require('node-cron');

JobController = {}

var task = cron.schedule('* * * * * *', () => {
   console.log('Running a job');
 });


JobController.start = async(req,res) => {
 task.start();
 res.json("started")
}

JobController.stop = async(req,res) =>{
  task.stop();
  res.json("stoped")
}

JobController.run = async(req,res) => {
  try{
    let model = new Model();
    let all_job = Object.values(JSON.parse(JSON.stringify(await new Job().where(`status = "waiting" or status = "in_progress"`))));

    
    for(const job of all_job){
      await model.updateJob(job.id,"in_progress")
      await getData(job.service,job.keyword,job.page,job.id)
      await model.updateJob(job.id,"success")
    }
    console.log("doneeeeeeeeeeeeee")
    // res.json("run succ")
  }catch(error){
    await model.updateJob(job.id,"error")
    // res.json("error")
  }
 
};

JobController.create = async(req,res) => {
  try{
    console.log("creating")
    let all_keyword = Object.values(JSON.parse(JSON.stringify(await new Keyword().get())));
    let all_facebook_page = Object.values(JSON.parse(JSON.stringify(await new Facebook_page().get())));
    console.log(all_facebook_page)
    let date = new Date();
    let created_time = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ');

    for (const keyword of all_keyword){
        await KeywordMatchingWithService(keyword.thai_word,keyword.eng_word,created_time) 
    }

    await FacebookPageMatchingWithFacebook(all_facebook_page,created_time)
    // res.json("succc")
  }catch(error){
    console.log(error,"create job")
    // res.json(error)
  }

};

function KeywordMatchingWithService(thai_word,eng_word,created_time){
    return new Promise (async(resolve) =>{
    try{
    let model = new Model();
    const services = Object.values(JSON.parse(JSON.stringify(await new Service().where(`not name = "facebook"`))))
    let page = 1 //----------->> actually is 100 <<----------------
    
    for (let service of services){
        if(service.name === "pantip"){
            page = 100 //----------->> actually is 1000 <<---------------------
        }
        let job_thai = {service: service.id,keyword: thai_word,status: "waiting",created_time: created_time,page: page}
        await model.addJob(job_thai)
        let job_eng = {service: service.id,keyword: eng_word,status: "waiting",created_time: created_time,page: page}
        await model.addJob(job_eng)
        page = 1
        }
        resolve()    
      }catch(error){
        console.log(error,"matching keyword")
        // res.json(error)
      }
    })
}

function FacebookPageMatchingWithFacebook(all_facebook_page,created_time){
  return new Promise (async(resolve) => {
    try{
    let model = new Model();
    for (let facebook_page of all_facebook_page){
      let job = {service: 5,keyword: facebook_page.name,status: "waiting",created_time: created_time,page:100}
      await model.addJob(job)
    }
    resolve()
  }catch(error){
    console.log(error,"matching keyword")
    // res.json(error)
  }
  })
}



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
      model.connect()

      if (service == 1) {
        obj = new Shopee();
      }
      else if (service == 2) {
        obj = new Amazon();
      }
      else if (service == 3) {
        obj = new Pantip();
      }
      else if (service == 4) {
        obj = new Jd();
      }
      else if (service == 5) {
        obj = new Facebook();
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
            if (service == 1 || service == 2 || service == 4) {
              pk_id = "product_id"
            }
            else {
              pk_id="post_id"
            }
            obj.check_product(value[pk_id], pk_id)
              .then(async (check) => {
                console.log("found =", check)

                if (check > 0) {
                  await obj.update_product(value, pk_id).then(() => {
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

module.exports = JobController ;