const Job = require("../model/Job");
const Keyword = require("../model/Keyword");
const Model = require("../model/model");
const Service = require("../model/Service");

JobController = {}

JobController.run = async(req,res) => {
    let all_job = Object.values(JSON.parse(JSON.stringify(await new Job().get())));
    
    for(const job of all_job){
        
    }





    res.json("run succ")
    

    
};

JobController.create = async(req,res) => {
    let all_keyword = Object.values(JSON.parse(JSON.stringify(await new Keyword().get())));

    for (const keyword of all_keyword){
        let job = await KeywordMatchingWithService(keyword.thai_word,keyword.eng_word)
  
    }

    res.json("succc")

};

function KeywordMatchingWithService(thai_word,eng_word){
    return new Promise (async(resolve) =>{
    let model = new Model();
    const services = Object.values(JSON.parse(JSON.stringify(await new Service().get())))
    let date = new Date();
    let createdTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ');
    let page = 10 //----------->> actually is 100 <<----------------
    
    for (let service of services){
        if(service.name === "pantip" || service.name === "facebook"){
            page = 100 //----------->> actually is 1000 <<---------------------
        }
        let job_thai = {service: service.name,keyword: thai_word,status: "waiting",created_time: createdTime,page: page}
        await model.addJob(job_thai)
        let job_eng = {service: service.name,keyword: eng_word,status: "waiting",created_time: createdTime,page: page}
        await model.addJob(job_eng)
        page = 10
        }
        resolve()    
    })
}





module.exports = JobController ;