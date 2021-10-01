const fs = require("fs");
const csv = require("neat-csv");
const { spawn } = require("child_process");
const Shopee_model = require("../model/Shopee.model");
const Amazon_model = require("../model/Amazon.model");
const Facebook_model = require("../model/Facebook.model");
const Jd_model = require("../model/Jd.model");
const Pantip_model = require("../model/Pantip.model");
var cron = require('node-cron');
const { create, result, reduce, reject } = require("lodash");
// const Eservice_model = require("../model/E_service.model")
const Keyword_model = require("../model/Keyword.model")
const Job_FaceBook_model = require("../model/Job_Facebook.model")
const Main_model = require("../model/Main.model")
const Job_model = require("../model/Job.model")
const Service_model = require("../model/Service.model")
const Facebook_page_model = require("../model/Facebook_page.model")
const Thaijo_model = require("../model/Thaijo.model")
const ScienceDirect_model = require("../model/ScienceDirect.model")
const { JSDOM, VirtualConsole } = require("jsdom")
const { window } = new JSDOM()
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
// const fs = require("fs")
const dotenv = require("dotenv")
const { Op } = require("sequelize")



JobController = {}

var create_task = cron.schedule('0 54 10 * * *', () => {
  console.log('create a job');
  // await JobController.create()
  //JobController.facebookCreateJob()
});

var run_task = cron.schedule('0 55 10 * * *', () => {
  console.log('Running a job');
  // await JobController.run()
  //JobController.runFacebook()
});


JobController.start = async (req, res) => {
  create_task.start();
  run_task.start();
  res.json("started")
}

JobController.stop = async (req, res) => {
  create_task.stop();
  run_task.stop();
  res.json("stoped")
}

JobController.progress = async (req, res) => {
  let count_all_job = await Job_model.count()
  let count_success_job = await Job_model.count({ where: { status: "success" } })
  let current_progress = { count_all_job: count_all_job, count_success_job: count_success_job }

  res.json({ current_progress })
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
          break;
        case "7":
          job.service = "science direct";
          break;
        case "8":
          job.service = "thaijo";
      }
    });
    res.json({ jobs })

  }
  catch (err) {
    console.log(err)
  }
}

JobController.getInside = async (req, res) => {
  try {
    const service = req.query.service
    await getDetail(service)
  }
  catch (error) {

  }
}

async function getDetail(service) {
  try {
    return new Promise(async (resolve) => {
      console.log("geting detail..")
      const raw = fs.readFileSync(process.env.FILE, "utf8")
      const header = raw.split(/\r?\n/)[0].split(",");
      results = (await csv(raw, { headers: header })).map(r => r.product_id); //turn csv file to object

      let Obj_model
      let input_num
      if (service == 1) {
        Obj_model = Shopee_model
        input_num = "9"
      }
      if (service == 2) {
        Obj_model = Amazon_model
        input_num = "10"
      }
      // rows = await Obj_model.findAll({where:{product_id : 5049388344}})
      rows = await Obj_model.findAll({ where: { product_id: results } })

      const csvWriter = createCsvWriter({
        path: '/Users/mcmxcix/nodeJSDB/sqlapp/input_file/input_file.csv',
        header: [
          { id: 'product_id', title: 'product_id' },
          { id: 'url', title: 'url' },
        ]
      })
      await csvWriter.writeRecords(rows)

      console.log("calling python")
      const start = window.performance.now()
      python = spawn(process.env.PYTHON_PATH, [
        process.env.SCRAPE_PATH
      ]);
      python.stdin.write(input_num);
      python.stdin.end();

      python.on("exit", async () => {
        console.log('on exit')
        const raw = fs.readFileSync(process.env.FILE, "utf8");
        const header = raw.split(/\r?\n/)[0].split(",");
        results = await csv(raw, { headers: header });

        for await (const [i, value] of results.entries()) {
          if (i != 0) {
            console.log(value["product_id"])
            let obj_row = await Obj_model.findOne({ where: { product_id: value["product_id"] } })
            if (obj_row) {
              await obj_row.update(value)
            }
          }

        }
        const stop = window.performance.now()
        console.log(`Time to getDetail = ${(stop - start) / 1000} seconds`);
        console.log("succ")
        resolve()
      });

    })
  }

  catch (error) {
    console.log(error)
    reject("error")
  }
}

JobController.getFacebookJob = async (req, res) => {
  try {
    let fb_job = await Job_FaceBook_model.findAll()
    console.log(fb_job)
    res.json(fb_job)
  }
  catch (error) {
    console.log(error)
  }

}

JobController.facebookCreateJob = async (req, res) => {
  try {
    console.log("facebook create")
    let all_facebook_page = await (Facebook_page_model.findAll())
    console.log(all_facebook_page)
    let created_time = new Date();
    await FacebookPageMatchingWithFacebook(all_facebook_page, created_time)
    console.log("succ")
  }
  catch (error) {
    console.log(error)
  }
}


JobController.facebook = async (req, res) => { //this funcc for read facebook in db and set words
  try {
    beauty_words = ["สวย", "หล่อ", "เท่ดูดี", "น่ารัก"]
    food_words = ["อาหาร", "เครื่องดืม", "ของกิน", "ขนม", "อร่อย"]
    health_words = ["สุขภาพ", "แข็งแรง", "บำรุง", "อ่อนเยาว์", "ฉลาด"]
    spa_words = ["หอม", "สบาย", "นวด", "สปา", "ผ่อนคลาย", "อโรมา"]
    travel_words = ["ท่องเที่ยว", "รื่นเริง", "เดินทาง", "ที่พัก", "โรงแรม", "พักผ่อน"]

    console.log("hello")
    facebooks = await Facebook_model.findAll()

    // text = "สวย---------สวย--------สวย-----อาหาร"
    for (let facebook of facebooks) {
      console.log("processing")
      let text = facebook.post_text
      let beauty_count = 0
      let food_count = 0
      let health_count = 0
      let spa_count = 0
      let travel_count = 0
      let beauty_array = []
      let food_array = []
      let health_arrray = []
      let spa_array = []
      let travel_array = []

      for await (word of beauty_words) {
        // console.log(word)
        beauty_count += text.split(word).length - 1

        if (text.split(word).length - 1 > 0) {
          beauty_array.push(word)
        }
        // console.log("count",beauty_count)
      }
      for await (word of food_words) {
        food_count += text.split(word).length - 1

        if (text.split(word).length - 1 > 0) {
          food_array.push(word)
        }
        // console.log("fff",food_count)
      }
      for await (word of health_words) {
        health_count += text.split(word).length - 1

        if (text.split(word).length - 1 > 0) {
          health_arrray.push(word)
        }
      }
      for await (word of spa_words) {
        spa_count += text.split(word).length - 1

        if (text.split(word).length - 1 > 0) {
          spa_array.push(word)
        }
      }
      for await (word of travel_words) {
        travel_count += text.split(word).length - 1

        if (text.split(word).length - 1 > 0) {
          travel_array.push(word)
        }
      }

      console.log("updating...")
      // console.log(food_count)
      console.log(facebook.id)
      await facebook.update({
        spa_word_count: spa_count,
        travel_word_count: travel_count,
        food_word_count: food_count,
        health_word_count: health_count,
        beauty_word_count: beauty_count,
        spa_word: spa_array.toString(),
        travel_word: travel_array.toString(),
        food_word: food_array.toString(),
        health_word: health_arrray.toString(),
        beauty_word: beauty_array.toString()

      })


      // console.log(facebook.user_name)
    }
    // console.log(facebook_row)
    // res.json(facebooks)
  }
  catch (error) {
    console.log(error)
  }
}

JobController.runFacebook = async (req, res) => {
  try {
    while(true){
    let job = await Job_FaceBook_model.findOne({
      where: {
        status: "waiting"
      }
    })

    if(job){
      job.service = 5
      let page_row = await Facebook_page_model.findAll({ where: { page_id: job.page_id } })
      await queuing(job, page_row)
    }
    else{
      console.log("runing job success")
      break
    }
  }

    // await getData(5,job.page_id,job.amount_post,job.id, all_page)

    // for await (const job of all_job_facebook){
    //   if (job.status == "waiting" || job.status == "in progress" ) {

    //     job.status = "in progress"
    //     job.start_time = new Date()
    //     await job.save()
    //     await getData(job.service,job.keyword,job.page,job.id, keyword_rows)
    //     if (job.service == 1 || job.service == 2){
    //       await getDetail(job.service)
    //     }
    //     job.status = "success"
    //     job.end_time = new Date()
    //     job.save()
    //   } 
    // }




  }
  catch (error) {
    console.log(error)
  }
}


JobController.run = async (req, res) => {
  try {

    while (true){

      let job = await Job_model.findOne({
        where: {
          status: "waiting"
        }
      })

      if (!job){ //no more job = break loop
        break
      }
      // let all_keyword = job.map(job => job.keyword)
      let keyword_row = await Keyword_model.findAll({
        where: {
          [Op.or]: [
            { thai_word: job.keyword },                   
            { eng_word: job.keyword}
          ]
        }
      })
      await queuing(job, keyword_row)
    }

    // for await (const job of all_jobs){
    //   if (job.status == "waiting" || job.status == "in progress" ) {
    //     job.status = "in progress"
    //     job.start_time = new Date()
    //     await job.save()
    //     await getData(job.service,job.keyword,job.page,job.id, keyword_rows)
    //     if (job.service == 1 || job.service == 2){
    //       await getDetail(job.service)
    //     }
    //     job.status = "success"
    //     job.end_time = new Date()
    //     job.save()
    //   }
    // }
    console.log("doneeeeeeeeeeeeee")
  } catch (error) {
    console.log("error", error)
  }

};

JobController.create = async (req, res) => {
  try {
    console.log("creating")
    let all_keyword = await Keyword_model.findAll({where:{
      isShow : 1
    }})
    // let all_facebook_page = await (Facebook_page_model.findAll())
    const services = await Service_model.findAll({
      where: {
        [Op.not]: [
          { name: "facebook" }
        ]
      }
    })
    let created_time = new Date();

    for (const keyword of all_keyword) {
      await KeywordMatchingWithService(keyword.thai_word, keyword.eng_word, created_time, services)
    }
    console.log("create job succ")
    // await FacebookPageMatchingWithFacebook(all_facebook_page,created_time)
    res.json("succc")
  } catch (error) {
    console.log(error, "create job")
  }

};

function KeywordMatchingWithService(thai_word, eng_word, created_time, services) {
  //add all keyword matching with service without facebook
  return new Promise(async (resolve) => {
    try {
      let page = 5 //----------->> actually is 100 <<----------------

      for (let service of services) {
        if (service.name === "pantip" || service.name === "science direct" || service.name === "thaijo") {
          page = 1000
        }

        if (service.name != "amazon" && service.name != "science direct") {
          let job_thai = { service: service.id, keyword: thai_word, status: "waiting", created_time: created_time, page: page }
          await Job_model.create(job_thai)
        }

        if (service.name != "thaijo") {
          let job_eng = { service: service.id, keyword: eng_word, status: "waiting", created_time: created_time, page: page }
          await Job_model.create(job_eng)
          page = 5
        }
      }

      resolve()
    } catch (error) {
      console.log(error, "matching keyword")
    }
  })
}

function FacebookPageMatchingWithFacebook(all_facebook_page, created_time) {
  //add all facebook page matching facebook only
  return new Promise(async (resolve) => {
    try {
      for (let facebook_page of all_facebook_page) {
        let job = { page_name: facebook_page.name, page_id: facebook_page.page_id, amount_post: 100, created_time: created_time, status: "waiting" } //amount_page == 100 (facebook 10 post per page)
        await Job_FaceBook_model.create(job)
      }
    }
    catch (error) {
      console.log(error)
    }
  })
}

function queuing(job, keyword_row = []) {
  return new Promise(async (resolve, reject) => {
    let start
    try {
      console.log(job)
      let search_word
      let amount
      let lasted_post_id = "no_limit"

      if (job.service != 5) { //nonfacebook
        search_word = job.keyword
        amount = job.page
      }
      else { //for facebook
        search_word = job.page_id
        amount = job.amount_post
        let result = keyword_row.find(row => row.name == job.page_name)
        if (result.lasted_post_id) {
          lasted_post_id = result.lasted_post_id
        }
      }
      job.status = "in progress"
      job.worker = process.env.WORKER_NAME
      job.start_time = new Date()
      await job.save()

      const start = window.performance.now()
      await getData(job.service, search_word, amount, job.id, keyword_row, lasted_post_id)
      if (job.service == 1 || job.service == 2) { //get detail for shopee,amazon
          function_status = await getDetail(job.service)
          const stop = window.performance.now()
          console.log(`Time to process ====> ${(stop - start) / 1000} seconds`);
          job.end_time = new Date()
          job.status = "success"
        }
        else{
          const stop = window.performance.now()
          console.log(`Time to process ====> ${(stop - start) / 1000} seconds`);
          job.end_time = new Date()
          job.status = "success"
        }
      job.save()
      resolve()
    }
    catch (error) {
      const stop = window.performance.now()
      console.log(`Time to process ====> ${(stop - start) / 1000} seconds`);
      job.status = "failed"
      job.end_time = new Date()
      job.save()
      resolve()
    }
  })
}



async function getData(service, search_word, page, job_id, all_keywords = [], lasted_post_id) {
  return new Promise(function (resolve, reject) {
    try {
      fs.writeFile(process.env.INPUT_FILE_TXT, search_word, (err) => {
        if (err) throw err;
      })


      let utfKeyword = encodeURI(search_word);
      python = spawn(process.env.PYTHON_PATH, [
        process.env.SCRAPE_PATH
      ]);

      if (service != 5) {
        console.log("sent to python --> ", service, page, search_word)
        python.stdin.write(`${service}\n` + page + "\n" + utfKeyword);
      }
      else {
        console.log("sent to python --> ", service, page, search_word, lasted_post_id)
        python.stdin.write(`${service}\n` + page + "\n" + search_word + "\n" + lasted_post_id);
      }

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

        let result
        let i = 0;
        let pk_id = ""
        let obj_model
        let keyword_row = {
          id: null,
          thai_word: null,
          eng_word: null
        }

        if (service != 5) {
          keyword_row = all_keywords.find(row => row.thai_word == search_word || row.eng_word == search_word)
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
          pk_id = "post_id"
        }
        else if (service == 4) {
          obj_model = Jd_model;
          pk_id = "product_id"
        }
        else if (service == 5) {
          obj_model = Facebook_model;
          pk_id = "post_id"
        }
        else if (service == 7) {
          obj_model = ScienceDirect_model;
          pk_id = "keyword_id"
        }
        else if (service == 8) {
          obj_model = Thaijo_model;
          pk_id = "issue_id"
        }

        const header = raw.split(/\r?\n/)[0].split(",");
        result = await csv(raw, { headers: header });
        // products
        for await (const value of result) {
      
          delete value["num"];
          if (i >= 1) { //not read header
            if (service != 7) { //for service ecom
              console.log("checking")
              const start = window.performance.now()
              check = await obj_model.findOne({ where: { [pk_id]: value[pk_id] } })
              const stop = window.performance.now()
              console.log(`Time to checking = ${(stop - start) / 1000} seconds`);
            }
            else { //when service is sci direct
              console.log("checking")
              // console.log(keyword_row.id)
              check = await obj_model.findOne({ where: { [pk_id]: keyword_row.id, year: value["year"] } })
            }

            if (!check) { //for saving
              console.log("saving")
              if (service == 7) {
                created_row = await obj_model.create({ ...value, job_id, keyword_id: keyword_row.id })
              }
              else {
                created_row = await obj_model.create({ ...value, job_id })
                if (service == 5 && i == 2) { //get post_id from i==2 in .csv (i == 1 : pin post, i == 2 : lasted_post)
                  console.log("updating facebook page")
                  let facebook_page_row = await Facebook_page_model.findOne({ where: { page_id: search_word } })
                  if (facebook_page_row) {
                    await facebook_page_row.update({ lasted_post_id: value["post_id"] })
                  }
                }
              }
              if (service != 5) { //facebook not in main
                await Main_model.create({
                  key_id: keyword_row.id,
                  service_id: service,
                  e_id: created_row.id
                })
              }
            }
            else { // for updating
              console.log("updating")
              await check.update({ ...value, job_id })

              if (service != 5) { //with out facebook cuz facebook not in main
                let main_row = await Main_model.count({ where: { e_id: check.id, key_id: keyword_row.id, service_id: service } })
                if (main_row == 0) {
                  await Main_model.create({
                    key_id: keyword_row.id,
                    service_id: service,
                    e_id: check.id,
                  })
                }
              }
              if (service == 5 && i == 2) { //get post_id from i==2 in .csv (i == 1 : pin post, i == 2 : lasted_post)
                console.log("updating facebook page")
                let facebook_page_row = await Facebook_page_model.findOne({ where: { page_id: search_word } })
                console.log(facebook_page_row)
                if (facebook_page_row) {
                  console.log("enter if ")
                  await facebook_page_row.update({ lasted_post_id: value["post_id"] })
                  console.log(facebook_page_row.lasted_post_id)
                  console.log(value["post_id"])
                  console.log("updated")
                }
              }
            }
          }
          i++;
        }
        resolve()
      });
    } catch (err) {
      console.log("get data", err)
      reject("error")
      // new Model().updateJob(job_id,"error")
    }
  });

}

JobController.progressFacebookJobs = async (req, res) => {
  let count_facebook_jobs = await Job_FaceBook_model.count()
  let count_success_facebook_jobs = await Job_FaceBook_model.count({ where: { status: "success" } })
  let current_progress_facebook_jobs = { count_facebook_jobs: count_facebook_jobs, count_success_facebook_jobs: count_success_facebook_jobs }

  res.json({ current_progress_facebook_jobs })
}

module.exports = JobController;