const Keyword = require("../model/Keyword");
const Main = require("../model/Main");
const Service = require("../model/Service");
const l = require('lodash');

KeywordController = {}

KeywordController.get = async (req, res) => {
    
    let keywords = await new Keyword().get();
    res.json( { keywords } );
}

KeywordController.fillter = async (req,res) => {
    services = await new Service().get()
    let id = req.query.id
    let result = await new Keyword().where("keyword.id = " + id);
    let keyword = Object.values(JSON.parse(JSON.stringify(result)))
    let maincount = []

    for (const service of services){
        try {
            data = await new Main().getKeywordCount(service.id,id);
            if (data > 0){        
                obj = {service: service.name , thai_word:keyword[0].thai_word ,eng_word:keyword[0].eng_word , count: data}
                // console.log(service.id + "service")
                // console.log(data)
                maincount.push(obj);
              }

        }catch(error){
            console.log(error,"error count inner")
          }

    }
    const lodash = l.groupBy(maincount,"service")
    res.json({lodash})
}

// KeywordController.getKeywordByService = async(req,res) => {
    
// });

KeywordController.post = async (req, res) => {
    let thai_word = req.body.thai_word
    let eng_word = req.body.eng_word
    console.log("thai",thai_word)
    await new Keyword().check(thai_word,eng_word);
    // await new Keyword().save();

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

module.exports = KeywordController ;