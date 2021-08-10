const Job = require("../model/Job");
const fs = require("fs");
const utf8 = require("utf8");
const csv = require("neat-csv");
const { spawn } = require("child_process");
const Amazon = require("../model/Amazon");
const Shopee = require("../model/Shopee");
const Shopee_model = require("../model/Shopee.model");
const Amazon_model = require("../model/Amazon.model");
const Facebook_model = require("../model/Facebook.model");
const Jd_model = require("../model/Jd.model");
const Pantip_model = require("../model/Pantip.model");
const Pantip = require("../model/Pantip");
const Jd = require("../model/Jd");
const Facebook = require("../model/Facebook");
const { resolve } = require("path");
const { rejects } = require("assert");
const Facebook_page = require("../model/Facebook_page");
var cron = require('node-cron');
const { create } = require("lodash");
// const Eservice_model = require("../model/E_service.model")
const Keyword_model = require("../model/Keyword.model")
const Main_model = require("../model/Main.model")
const Job_model = require("../model/Job.model")
const Service_model = require("../model/Service.model")
const Facebook_page_model = require("../model/Facebook_page.model")
const Thaijo_model = require("../model/Thaijo.model")

const {Op} = require("sequelize")



JobController = {}

var create_task = cron.schedule('0 54 10 * * *', () => {
  console.log('create a job');
  // JobController.create()
  });

var run_task = cron.schedule('0 55 10 * * *', () => {
   console.log('Running a job');
    // JobController.run()
 });


JobController.start = async(req,res) => {
 create_task.start();
 run_task.start();
 res.json("started")
}

JobController.stop = async(req,res) =>{
  create_task.stop();
  run_task.stop();
  res.json("stoped")
}

JobController.progress = async(req,res) => {
  let count_all_job = await Job_model.count()
  let count_success_job = await Job_model.count({where: {status: "success"}})
  let current_progress = {count_all_job: count_all_job,count_success_job:count_success_job}

  res.json({current_progress})
}

JobController.get = async (req, res) => {
  try {
      let jobs = await Job_model.findAll();

      jobs.forEach((job) => {
          
          // Convert Service
          switch (job.service) {
              case "1":
                  job.service = "shopee";
                  break;
              case "2":
                  job.service = "amazon";
                  break;
              case "3":
                  job.service = "pantip";
                  break;
              case "4":
                  job.service = "jd";
                  break;
              case "5":
                  job.service = "facebook"
          }
      });
      res.json({ jobs})

  }
  catch (err) {
      console.log(err)
  }
}


JobController.run = async(req,res) => {
  try{
    let all_jobs = await Job_model.findAll({where: {
      [Op.or]: [
        {status: "waiting"},
        {status: "in progress"}
      ]
    }})

    let all_keyword = all_jobs.map(job => job.keyword)
    let keyword_rows = await Keyword_model.findAll({where:  {
      [Op.or]: [
        {thai_word: {[Op.in] : all_keyword}},
        {eng_word: {[Op.in] : all_keyword}}
      ]}
    })  

    
    // for await (const job of all_job){
    for await (const job of all_jobs){
      if (job.status == "waiting" || job.status == "in progress" ) {

        job.status = "in progress"
        job.start_time = new Date()
        await job.save()
        await getData(job.service,job.keyword,job.page,job.id, job, keyword_rows)
        job.status = "success"
        job.end_time = new Date()
        job.save()
      } 
    }
    console.log("doneeeeeeeeeeeeee")
  }catch(error){
    console.log("error",error)
  }
 
};

JobController.create = async(req,res) => {
  try{
    console.log("creating")
    let all_keyword = await Keyword_model.findAll()
    let all_facebook_page = await (Facebook_page_model.findAll())
    const services = await Service_model.findAll({where: {
      [Op.not]: [
      {name: "facebook"}
    ]}})
    let created_time = new Date();

    for (const keyword of all_keyword){
        await KeywordMatchingWithService(keyword.thai_word,keyword.eng_word,created_time,services) 
    }

    await FacebookPageMatchingWithFacebook(all_facebook_page,created_time)
    res.json("succc")
  }catch(error){
    console.log(error,"create job")
  }

};

function KeywordMatchingWithService(thai_word,eng_word,created_time,services){
  //add all keyword matching with service without facebook
    return new Promise (async(resolve) =>{
    try{
    let page = 5 //----------->> actually is 100 <<----------------
    
    for (let service of services){
        if(service.name === "pantip"){
          let word = thai_word + " " + eng_word
          let pantip_job = {service: service.id,keyword: word,status: "waiting",created_time: created_time,page: 1000}
          await Job_model.create(pantip_job)
        }

        if(service.name != "pantip"){
          if(service.name != "amazon"  || service.name != "science direct"){
            let job_thai = {service: service.id,keyword: thai_word,status: "waiting",created_time: created_time,page: page}
            await Job_model.create(job_thai)
          }
          
        if(service.name != "thaijo"){
          let job_eng = {service: service.id,keyword: eng_word,status: "waiting",created_time: created_time,page: page}
          await Job_model.create(job_eng)
          }
        }
        }
        resolve()    
      }catch(error){
        console.log(error,"matching keyword")
      }
    })
}

function FacebookPageMatchingWithFacebook(all_facebook_page,created_time){
  //add all facebook page matching facebook only
  return new Promise (async(resolve) => {
    try{
    for (let facebook_page of all_facebook_page){
      let job = {service: 5,keyword: facebook_page.page_id,status: "waiting",created_time: created_time,page:100}
      await Job_model.create(job)
    }
    resolve()
  }catch(error){
    console.log(error,"matching keyword")
  }
  })
}



async function getData(service, keyword, page,job_id, job = null, all_keywords=[]) {
return new Promise(function (resolve, reject) {
  try {
    let utfKeyword = encodeURI(keyword);
    python = spawn(process.env.PYTHON_PATH, [
      process.env.SCRAPE_PATH
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
      const raw = fs.readFileSync(process.env.FILE, "utf8");
      console.log(`child process close all stdio with code ${code}`);

      let i = 0;
      let pk_id = ""
      let obj_model
      let keyword_row = {
        id: null,
        thai_word: null,
        eng_word: null
      }

      if(service != 5){
        keyword_row = all_keywords.find(row => row.thai_word == keyword || row.eng_word == keyword)
      //   keyword_row = await Keyword_model.findOne({where: {[Op.or]: [
      //     {thai_word: keyword},
      //     {eng_word: keyword}
      //   ]}
      // })  
      }

      if (service == 1) {
        obj_model = Shopee_model;
        pk_id = "product_id"
      }
      else if (service == 2) {
        obj_model = Amazon_model;
        pk_id = "product_id"
      }
      else if (service == 3) {
        obj_model = Pantip_model;
        pk_id="post_id"
      }
      else if (service == 4) {
        obj_model = Jd_model;
        pk_id = "product_id"
      }
      else if (service == 5) {
        obj_model = Facebook_model;
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

      // products
      for await (const value of result) {
        delete value["num"];
          if (i >= 1) {
            console.log(obj_model)
            let check = await obj_model.findOne({where: {[pk_id]: value[pk_id]}})

            if (!check) {
                  let created_row = await obj_model.create({...value,job_id})
                  console.log("service",service)
                    await Main_model.create({
                      key_id:keyword_row.id,
                      service_id: service,
                      e_id: created_row.id
                    })
                } else { 
                  console.log(check)
                  await check.update({...value,job_id})
                  if(service != 5){
                    let main_row = await Main_model.count({where: {e_id:check.id , key_id: keyword_row.id ,service_id: service}})
                    if(main_row == 0){
                      await Main_model.create({
                        key_id: keyword_row.id ,
                        service_id : service,
                        e_id: check.id,
                      })
                    }
                  }            
                }
          }
        i++;
      } resolve()
      
    });
  } catch (err) {
    console.log("get data", err)
    // new Model().updateJob(job_id,"error")

  }
});

}

module.exports = JobController ;