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
  // JobController.create()
});

var run_task = cron.schedule('0 55 10 * * *', () => {
  console.log('Running a job');
  // JobController.run()
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
        path: process.env.INPUT_FILE_CSV,
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

      await python.on("exit", async () => {
        console.log('on exit')
        const raw = fs.readFileSync(process.env.FILE, "utf8");
        const header = raw.split(/\r?\n/)[0].split(",");
        results = await csv(raw, { headers: header });

        for await (const [i, value] of results.entries()) {
          if (i != 0) {
            console.log(value)
            console.log(value["product_id"])
            let obj_row = await Obj_model.findOne({ where: { product_id: value["product_id"] } })
            if (obj_row) {
              await obj_row.update(value)
            }
          }
          const stop = window.performance.now()
          console.log(`Time to getDetail = ${(stop - start) / 1000} seconds`);

          resolve()
          console.log("succ")
        }
      });
    })
  }

  catch (error) {
    console.log(error)
  }
}

JobController.getFacebookJob = async(req,res) => {
  try{
    let fb_job = await Job_FaceBook_model.findAll()
    console.log(fb_job)
    res.json(fb_job)
  }
  catch(error){
    console.log(error)
  }

}

JobController.facebookCreateJob = async(req,res) => {
  try{
    console.log("facebook create")
    let all_facebook_page = await (Facebook_page_model.findAll())
    console.log(all_facebook_page)
    let created_time = new Date();
    await FacebookPageMatchingWithFacebook(all_facebook_page,created_time)
    console.log("succ")
  }
  catch(error){
    console.log(error)
  }
}


JobController.facebook = async(req,res) => {
  try{
    beauty_words = ["สวย","หล่อ","เท่ดูดี","น่ารัก"]
    food_words = ["อาหาร","เครื่องดืม","ของกิน","ขนม","อร่อย"]
    health_words = ["สุขภาพ","แข็งแรง","บำรุง","อ่อนเยาว์","ฉลาด"]
    spa_words = ["หอม","สบาย","นวด","สปา","ผ่อนคลาย","อโรมา"]
    travel_words = ["ท่องเที่ยว","รื่นเริง","เดินทาง","ที่พัก","โรงแรม","พักผ่อน"]

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


JobController.run = async (req, res) => {
  try {
    let all_jobs = await Job_model.findAll({
      where: {
        [Op.or]: [
          { status: "waiting" },
          { status: "in progress" }
        ]
      }
    })

    let all_keyword = all_jobs.map(job => job.keyword)
    let keyword_rows = await Keyword_model.findAll({
      where: {
        [Op.or]: [
          { thai_word: { [Op.in]: all_keyword } },
          { eng_word: { [Op.in]: all_keyword } }
        ]
      }
    })


    // for await (const job of all_job){
    for await (const job of all_jobs) {
      if (job.status == "waiting" || job.status == "in progress") {

        job.status = "in progress"
        job.start_time = new Date()
        await job.save()
        await getData(job.service, job.keyword, job.page, job.id, job, keyword_rows)
        if (job.service == 1 || job.service == 2) {
          await getDetail(job.service)
        }
        job.status = "success"
        job.end_time = new Date()
        job.save()
      }
    }
    console.log("doneeeeeeeeeeeeee")
  } catch (error) {
    console.log("error", error)
  }

};

JobController.create = async (req, res) => {
  try {
    console.log("creating")
    let all_keyword = await Keyword_model.findAll()
    // let all_facebook_page = await (Facebook_page_model.findAll())
    const services = await Service_model.findAll({where: {
      [Op.not]: [
      {name: "facebook"}
    ]}})
    let created_time = new Date();

    for (const keyword of all_keyword) {
      await KeywordMatchingWithService(keyword.thai_word, keyword.eng_word, created_time, services)
    }

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
        let job = {page_name:facebook_page.name,page_id:facebook_page.page_id,amount_post:100,created_time:created_time}
        await Job_FaceBook_model.create(job)
      }
      resolve()
    } catch (error) {
      console.log(error, "matching keyword")
    }
  })
}



async function getData(service, keyword, page, job_id, job = null, all_keywords = []) {
  return new Promise(function (resolve, reject) {
    try {
      fs.writeFile(process.env.INPUT_FILE_TXT, keyword, (err) => {
        if (err) throw err;
      })
      console.log(service)
      let utfKeyword = encodeURI(keyword);
      python = spawn(process.env.PYTHON_PATH, [
        process.env.SCRAPE_PATH
      ]);

      if (service != 8) {
        console.log("sent to python --> ", service, page, utfKeyword)
        python.stdin.write(`${service}\n` + page + "\n" + utfKeyword);
      }
      else {
        console.log("sent to python --> ", service, page, keyword)
        python.stdin.write(`${service}\n` + page + "\n" + keyword);
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

        let i = 0;
        let pk_id = ""
        let obj_model
        let keyword_row = {
          id: null,
          thai_word: null,
          eng_word: null
        }

        if (service != 5) {
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
            if (service != 7) {
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
              }
              console.log("service", service)
              await Main_model.create({
                key_id: keyword_row.id,
                service_id: service,
                e_id: created_row.id
              })
            }
            else { // for updating
              console.log("updating")
              await check.update({ ...value, job_id })

              if (service != 5) {
                let main_row = await Main_model.count({ where: { e_id: check.id, key_id: keyword_row.id, service_id: service } })
                if (main_row == 0) {
                  await Main_model.create({
                    key_id: keyword_row.id,
                    service_id: service,
                    e_id: check.id,
                  })
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
      // new Model().updateJob(job_id,"error")

    }
  });

}

module.exports = JobController;