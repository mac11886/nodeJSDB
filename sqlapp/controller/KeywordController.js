const Keyword = require("../model/Keyword");
const Service = require("../model/Service");
const Model = require("../model/Model");
const Main = require("../model/Main");
const Facebook = require("../model/Facebook");
const l = require('lodash');

KeywordController = {}

function service_loop (keyword,id,services){
    return new Promise(async(resolve,reject) => {
        let maincount = []
        let data =0
        console.log(keyword)
        for (let service of services){
            console.log(service.id)
        try {
            if(service.id === 5){
                data = await new Facebook().searchKeywordCount(keyword.thai_word,keyword.eng_word)  
            }else{
                data = await new Main().getKeywordCount(service.id,id)
            }
        let obj = {service: service.name , thai_word:keyword.thai_word ,eng_word:keyword.eng_word , count: data}
        console.log("objjj",obj)
        maincount.push(obj) 
        }catch(error){
            console.log(error,"error count inner")
          }
        }
        resolve(maincount)
    })   
}





KeywordController.getKeywordByService = async(req,res) => {

    const service = req.query.service
    const service_id = req.query.service_id
    const id = req.query.id
    const words = await new Keyword().where("id = "+id)
    const thai_word = words[0].thai_word
    const eng_word = words[0].eng_word
 
    if(service === "facebook"){
        try{
            let data = await new Facebook().searchKeywordAll(thai_word,eng_word)
                res.json({data})
            }catch(error){
                res.json()
            }
    }else{
        try{
        let data = await new Model().getproductbykeyword(service,id,service_id)
            res.json({data})
        }catch(error){
            res.json()
        }
    }    
};

KeywordController.get = async (req, res) => {
    let keywords = await new Keyword().get();
    res.json({ keywords });

}

KeywordController.post = async (req, res) => {
    let thai_word = req.body.thai_word
    let eng_word = req.body.eng_word
    console.log("thai", thai_word)
    try {
        await new Keyword().check(thai_word, eng_word);
    } catch (error) {
        console.log("keyword.post", error)
    }

}

KeywordController.delete = async (req, res) => {

    try {
        console.log(req.body)
        let id = req.body.id
        console.log(id)
        await new Keyword().delete(id);
    } catch (error) {
        console.log("error delete", error)
    }
}

KeywordController.fillter = async (req, res) => {
    // let services = await new Service().get()
    // const id = req.query.id
    // let result = await new Keyword().where("keyword.id = " + id);
    // const keyword = Object.values(JSON.parse(JSON.stringify(result)))
    // let maincount = []
    // let data = 0
    // for (const service of services){
    //     try {
    //         if(service.id === 5){
    //             data = await new Facebook().searchKeywordCount(keyword[0].thai_word)    
    //         }else{
    //             data = await new Main().getKeywordCount(service.id,id)  
    //         }
    //     let obj = {service: service.name , thai_word:keyword[0].thai_word ,eng_word:keyword[0].eng_word , count: data}
    //     maincount.push(obj) 
    //     }catch(error){
    //         console.log(error,"error count inner")
    //       }
    // }
    // const lodash = l.groupBy(maincount,"service")
    // res.json({lodash})
    let values = new Promise(async(resolve,reject) => {
        const  id = req.query.id
        let where = await new Keyword().where("id = " + id);
        const keyword = Object.values(JSON.parse(JSON.stringify(where)))[0]
        let get = await new Service().get()
        let services = Object.values(JSON.parse(JSON.stringify(get)))
        resolve({keyword:keyword,id:id,services:services})
    })
    values.then(async(resolve)=>{
        let maincount = service_loop(resolve.keyword,resolve.id,resolve.services)
        maincount.then(async(maincount) =>{
            const lodash = l.groupBy(maincount,"service")
            res.json({lodash}) 
        })
    })
}

KeywordController.getKeywordByService = async (req, res) => {
    const service = req.query.service
    const id = req.query.id
    const words = await new Keyword().where("id = " + id)
    const thai_word = words[0].thai_word
    const eng_word = words[0].eng_word

    if (service === "facebook") {
        try {
            let data = await new Facebook().searchKeywordAll(thai_word, eng_word)
            res.json({ data })
        } catch (error) {
            res.json()
        }

    } else {
        try {
            let data = await new Model().getproductbykeyword(service, id)
            res.json({ data })
        } catch (error) {
            res.json()
        }


    };
}

module.exports = KeywordController