const Keyword = require("../model/Keyword");
const Service = require("../model/Service");
const Model = require("../model/Model");
const Main = require("../model/Main");
const Facebook = require("../model/Facebook");
const l = require('lodash');

KeywordController = {}

KeywordController.get = async (req, res) => {
    let keywords = await new Keyword().get();
    res.json( { keywords } );

}

KeywordController.post = async (req, res) => {
    let thai_word = req.body.thai_word
    let eng_word = req.body.eng_word
    console.log("thai",thai_word)
    try{
        await new Keyword().check(thai_word,eng_word);
    }catch(error){
        console.log("keyword.post",error)
    }

}

KeywordController.delete = async (req, res) => {

    try{
        console.log(req.body)
        let id = req.body.id
        console.log(id)
        await new Keyword().delete(id);
    }catch(error){
        console.log("error delete",error)
    }
}

KeywordController.fillter = async (req,res) => {
    services = await new Service().get()
    let id = req.query.id
    console.log("qqqqqqq ID :",id);
    let result = await new Keyword().where("keyword.id = " + id);
    let keyword = Object.values(JSON.parse(JSON.stringify(result)));
    console.log("KEYWORD",keyword[0].thai_word);
    let maincount = []

    for (const service of services){
        try {
            if(service.id===5){
                data = await new Facebook().searchKeywordCount(keyword[0].thai_word);
                console.log(data);
            }
            else{
                data = await new Main().getKeywordCount(service.id,id);
                console.log(data);
            }

            if (data > 0){        
                obj = {service: service.name , thai_word:keyword[0].thai_word ,eng_word:keyword[0].eng_word , count: data}
                console.log(obj)
                maincount.push(obj);
            }

        }catch(error){
            console.log(error,"error count inner")
          }

    }
    const lodash = l.groupBy(maincount,"service")
    res.json({lodash})
}

KeywordController.getKeywordByService = async(req,res) => {
    let service = req.query.service
    let id = req.query.id
    console.log(service,id)
    try{
    let data = await new Model().getproductbykeyword(service,id)
        res.json({data})
    }catch(error){
        console.log("getKeywordByService",error)
    }
        
    
};

module.exports = KeywordController ;