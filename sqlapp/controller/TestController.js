const Amazon = require("../model/Amazon");
const Job = require("../model/Job");
const Model = require("../model/model");
const Shopee = require("../model/Shopee");
var _ = require('lodash');

TestController = {}

TestController.test = async (req, res) => {
  try{
    var maincount = []
    keywords = await new Model("keyword").get();
    services = await new Model("service").get();

    for(const key of keywords){
      for(const service of services){
        try{
        data = await new Model("main").getkeywordcount(service.id ,key.id);
        if (data > 0){        
        obj = {service: service.name , keyword:key.word , count: data}
        console.log(service.id + "service")
        // console.log(data)
        maincount.push(obj)
        }
      }catch(error){
        console.log(error,"error count")
      }
      }
    }
    // console.log(maincount)
    // console.log(maincount[1])
    // const shopee =maincount.filter(service => service.service === "Shopee")
    // console.log(shopee)

    const lodash = _.groupBy(maincount,"service")
    console.log(lodash)

    res.render("status.ejs", { lodash ,keywords });
  }catch(error){
    console.log(error,"error count")
  }
}

module.exports = TestController