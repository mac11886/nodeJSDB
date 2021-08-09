const Model = require("../model/Model");
const Keyword = require("../model/Keyword")
const l = require('lodash');
const Service = require("../model/Service");
const Main = require("../model/Main");
const Keyword_model = require("../model/Keyword.model");
const Service_model = require("../model/Service.model");
const Main_model = require("../model/Main.model");


TestController = {}

TestController.test = async (req, res) => {
  try{
    var maincount = []
    
    // keywords = await new Keyword().get();
    keywords = await Keyword_model.findAll()
    // console.log(keywords)
    // console.log(keywords);
    // services = await new Service().get();

    // services = await Service_model.findAll();

    // for(const key of keywords.map(r => r)){
    //   console.log(key.thai_word)
    //   for(const service of services.map(r => r)){
    //     try{

          // data = await new Main().getKeywordCount(service.id ,key.id);

          // let count = await Main_model.count({where:{key_id: key.id,service_id: service.id}});

          // console.log(data);

        // if (count > 0){        
        //   obj = {service: service.name , thai_word:key.thai_word , count: count}

          // console.log(obj);
          // console.log(service.id + "service")
          // console.log(data)

          // maincount.push(obj);
      //   }
      // }catch(error){
      //   console.log(error,"error count inner")
      // }
    //   }
    // }
    // console.log(maincount)
    // console.log(maincount[1])
    // const shopee =maincount.filter(service => service.service === "Shopee")
    // console.log(shopee)

    // const lodash = l.groupBy(maincount,"service")
    // console.log(lodash)
    
    // res.json({lodash,keywords})
    res.json({keywords})

  }catch(error){
    console.log(error,"error count outer")
  }
}

module.exports = TestController;