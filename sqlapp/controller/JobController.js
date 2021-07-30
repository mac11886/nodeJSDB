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
const { create, result } = require("lodash");

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
  // create_task.start();
  // run_task.start();
  res.json("started")
}

JobController.stop = async (req, res) => {
  // create_task.stop();
  // run_task.stop();
  res.json("stoped")
}

JobController.progress = async (req, res) => {
  let count_all_job = await new Job().getcount();
  let count_success_job = await new Job().wherecount(`status = "success"`);
  let current_progress = { count_all_job: count_all_job, count_success_job: count_success_job }

  res.json({ current_progress })
  // resolve({})
  // })
}

JobController.get = async (req, res) => {
  try {
    let jobs = await new Job().get();
    jobs.forEach((job) => {
      // Convert Created time
      let created_time = new Date(job.created_time);
      let iso_created_time = new Date(
        created_time.getTime() - created_time.getTimezoneOffset() * 60000
      ).toISOString().slice(0, 19).replace("T", " ");
      job.created_time = iso_created_time;

      // Convert Start time
      if (job.start_time == null) {
        job.start_time = "not started yet";
      } else {
        let start_time = new Date(job.start_time); // Or the date you'd like converted.
        let iso_start_time = new Date(
          start_time.getTime() - start_time.getTimezoneOffset() * 60000
        ).toISOString().slice(0, 19).replace("T", " ");
        job.start_time = iso_start_time;
      }

      // Convert End time
      if (job.end_time == null) {
        if (job.start_time != "not started yet") {
          job.end_time = "not done yet";
        } else {
          job.end_time = "not started yet";
        }
      } else {
        let end_time = new Date(job.end_time); // Or the date you'd like converted.
        let iso_end_time = new Date(
          end_time.getTime() - end_time.getTimezoneOffset() * 60000
        ).toISOString().slice(0, 19).replace("T", " ");
        job.end_time = iso_end_time;
      }

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
    res.json({ jobs })

  }
  catch (err) {
    console.log(err)
  }
}


JobController.run = async (req, res) => {
  try {
    let model = new Model();
    let all_job = Object.values(JSON.parse(JSON.stringify(await new Job().where(`status = "waiting" or status = "in progress"`))));


    for (const job of all_job) {
      await model.updateJob(job.id, "in_progress")
      await getData(job.service, job.keyword, job.page, job.id)
      await model.updateJob(job.id, "success")
    }
    console.log("doneeeeeeeeeeeeee")
    // res.json("run succ")
  } catch (error) {
    await model.updateJob(job.id, "error")
    // res.json("error")
  }

};

JobController.create = async (req, res) => {
  try {
    console.log("creating")
    let all_keyword = Object.values(JSON.parse(JSON.stringify(await new Keyword().get())));
    let all_facebook_page = Object.values(JSON.parse(JSON.stringify(await new Facebook_page().get())));
    let date = new Date();
    let created_time = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ');

    for (const keyword of all_keyword) {
      await KeywordMatchingWithService(keyword.thai_word, keyword.eng_word, created_time)
    }

    // await FacebookPageMatchingWithFacebook(all_facebook_page, created_time)
    res.json("succc")
  } catch (error) {
    console.log(error, "create job")
    res.json(error)
  }

};

function KeywordMatchingWithService(thai_word, eng_word, created_time) {
  return new Promise(async (resolve) => {
    try {
      let model = new Model();
      const services = Object.values(JSON.parse(JSON.stringify(await new Service().where(`not name = "facebook"`))))
      let page = 5 //----------->> actually is 100 <<----------------

      for (let service of services) {
        if (service.name === "pantip") {
          page = 1000 //----------->> actually is 1000 <<---------------------
        }
        let job_thai = { service: service.id, keyword: thai_word, status: "waiting", created_time: created_time, page: page }
        console.log(1,job_thai)
        await model.addJob(job_thai)
        let job_eng = { service: service.id, keyword: eng_word, status: "waiting", created_time: created_time, page: page }
        console.log(2,job_eng)
        await model.addJob(job_eng)
        page = 5
      }
      resolve()
    } catch (error) {
      console.log(error, "matching keyword")
      // res.json(error)
    }
  })
}

function FacebookPageMatchingWithFacebook(all_facebook_page, created_time) {
  return new Promise(async (resolve) => {
    try {
      let model = new Model();
      for (let facebook_page of all_facebook_page) {
        let job = { service: 5, keyword: facebook_page.name, status: "waiting", created_time: created_time, page: 100 }
        await model.addJob(job)
      }
      resolve()
    } catch (error) {
      console.log(error, "matching keyword")
      // res.json(error)
    }
  })
}



async function getData(service, keyword, page, job_id) {
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
        let obj
        let job = new Job();
        let model = new Model();
        let pk_id = ""
        let result;
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
          pk_id = "post_id"
        }
        else if (service == 4) {
          obj = new Jd();
          pk_id = "product_id"
        }
        else if (service == 5) {
          obj = new Facebook();
          pk_id = "post_id"
        }
        else {
          obj = new Model();
        }

        const header = raw.split(/\r?\n/)[0].split(",");
        try {
          result = await csv(raw, { headers: header });
        }
        catch (err) {
          console.log(err, "error result")
          return;
        }

        for await (const value of result) {
          delete value["num"];
          try {
            if (i >= 1) {
              // console.log("checking")
              
              let check = await obj.check_product(value[pk_id])
                // .then(async (check) => {
                  console.log("found =", check)
                  if (check == 0) {
                    obj.saveEcom(value, keyword).then(() => {
                      obj.updateJobId(job_id);
                    })
                  } else {
                    obj.update_product(value).then(() => {
                      obj.updateJobId(job_id);
                    })
                  }
                // }); 
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

module.exports = JobController;