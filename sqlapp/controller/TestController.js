const Model = require("../model/Model");
const Keyword = require("../model/Keyword")
var l = require('lodash');
const Service = require("../model/Service");
const Main = require("../model/Main");

TestController = {}

TestController.test = async (req, res) => {
  try{
    var maincount = []
    keywords = await new Keyword().get();
    // console.log(keywords);
    services = await new Service().get();
    

    for(const key of keywords){
      for(const service of services){
        try{
          data = await new Main().getKeywordCount(service.id ,key.id);
          // console.log(data);
        if (data > 0){        
          obj = {service: service.name , keyword:key.word , count: data}
          // console.log(obj);
          // console.log(service.id + "service")
          // console.log(data)
          maincount.push(obj);
        }
      }catch(error){
        console.log(error,"error count")
      }
      }
    }
    // console.log(maincount)
    // console.log(maincount[1])
    const shopee =maincount.filter(service => service.service === "Shopee")
    // console.log(shopee)

    const lodash = l.groupBy(maincount,"service")
    // console.log(lodash)

    res.render("status.ejs", { lodash });
  }catch(error){
    console.log(error,"error count")
  }
}

module.exports = TestController;