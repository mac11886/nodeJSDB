const Keyword = require("../model/Keyword");
const Main = require("../model/Main");
const Service = require("../model/Service");
const Model = require("../model/Model");
const l = require('lodash');
const Facebook = require("../model/Facebook");
const Keyword_model = require("../model/Keyword.model")
const Service_model = require("../model/Service.model")
const Main_model = require("../model/Main.model")
const Facebook_model = require("../model/Facebook.model")
const Shopee_model = require("../model/Shopee.model")
const Amazon_model = require("../model/Amazon.model")
const Pantip_model = require("../model/Pantip.model")
const Jd_model = require("../model/Jd.model")

const {Op, where} = require("sequelize")


KeywordController = {}

KeywordController.get = async (req, res) => {
    try{
    let keywords = await Keyword_model.findAll();
    res.json( { keywords } );
    }catch(error){
        res.json();
    }
}

KeywordController.fillter = (req,res) => {
    let id = ""
    let keyword_row = ""
    let services = ""


    let values = new Promise(async(resolve,reject) => {
        id = req.query.id
        console.log(id)
        // let where = await new Keyword().where("id = " + id);
        keyword_row = await Keyword_model.findOne({where: {id:id}})
        console.log("keyyyyy ++++",keyword_row)
        // const keyword = Object.values(JSON.parse(JSON.stringify(where)))[0]
        // console.log("key => ",keyword)
        
        services = await Service_model.findAll()

        resolve({keyword:keyword_row,id:id,services:services})
        // resolve(keyword_row,id,services)
    })
    values.then(async(resolve)=>{
        console.log("services ---->",resolve.keyword)
        let maincount = await service_loop(resolve.keyword,resolve.id,resolve.services)
        console.log("maincount=====>>>>",maincount)

        
        const lodash = l.groupBy(maincount,"service")

        console.log(lodash)
        res.json({lodash}) 
        
    })
   


    // for (let service of services){
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
}

function service_loop (keyword,id,services){
    return new Promise(async(resolve,reject) => {
        
        let maincount = []
        let data = 0
        console.log("keyword",keyword)

        for (let service of services){
            console.log(service.id)
        try {
            if(service.id === 5){
                data = await Facebook_model.count({where: {[Op.or]: [
                    {post_text: {[Op.like] : '%'+keyword.thai_word+'%'}},
                    {post_text: {[Op.like] : '%'+keyword.eng_word+'%'}}
                ]}
            })
                // data = await new Facebook().searchKeywordCount(keyword.thai_word,keyword.eng_word)  
            
                
            }else{
                // data = await new Main().getKeywordCount(service.id,id)
                data = await Main_model.count({where: {[Op.and]: [
                    {service_id:service.id},
                    {key_id: id}
                ]}
            })
                
            }

        let obj = {service: service.name , thai_word:keyword.thai_word ,eng_word:keyword.eng_word , count: data}
        console.log("objjj",obj)
        maincount.push(obj) 

        }catch(error){
            console.log(error,"error count inner")
          }

        }
        // console.log(maincount)
        resolve(maincount)
    })
    
}


KeywordController.getKeywordByService = async(req,res) => {

    const service = req.query.service
    const service_id = req.query.service_id
    const id = req.query.id
    const word = await Keyword_model.findOne({where: {id:id}})

    // console.log(words)
    // const words = await new Keyword().where("id = "+id)
    // const thai_word = words[0].thai_word
    // const eng_word = words[0].eng_word 
    if(service === "facebook"){
        service_model = Facebook_model
        try{
            let data = "notthing"
            // let data = await new Facebook().searchKeywordAll(thai_word,eng_word)
            // data = await new Facebook().searchKeywordAll(thai_word,eng_word)
            data = await Facebook_model.findAll({where: {[Op.or]: [
                {post_text: {[Op.like] : '%'+word.thai_word+'%'}},
                {post_text: {[Op.like] : '%'+word.eng_word+'%'}}
            ]}
            })
            // console.log(data)
                res.json(data)
            }catch(error){
                res.json()
            }

    }else{
        try{
        let data = await Main_model.findAll({where:{key_id: id,service_id: service_id},include: service});
        datas = data.map(r => r[service])
        console.log(datas[0].name)

        res.json(data.map(r => r[service]))

        }catch(error){
            console.log(error)
            res.json("error")
        }
    }

        
    
};

KeywordController.post = async (req, res) => {
    // let model = new Model();
    let thai_word = req.body.thai_word
    console.log(thai_word)
    let eng_word = req.body.eng_word

    try{
        // await new Keyword().check(thai_word,eng_word); 
        // check keyword in db and insert to db if not
        keyword_check = await Keyword_model.count({where: {
            [Op.and]: [
              {thai_word: thai_word},
              {eng_word: eng_word}
            ]
          }})
        if(keyword_check == 0){
            console.log("add key")
            await Keyword_model.create({thai_word:thai_word,eng_word:eng_word})
        } // check keyword in db and insert to db if not
    }catch(error){
        console.log("keyword.post",error)
    }
    // model.close();
    res.json("success")

}


KeywordController.delete = async (req, res) => {
    try{
    let id = req.body.id
    console.log(id)
    await Keyword_model.destroy({where: {
        id:id
    }});
    }catch(error){
        console.log("error delete",error)
    }
    console.log("del keyword succ")
    res.json("del suc keyword")

}

module.exports = KeywordController ;