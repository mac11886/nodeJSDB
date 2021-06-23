const Keyword = require("../model/Keyword");
const l = require('lodash');
const Service = require("../model/Service");
const Main = require("../model/Main");
const E_service = require("../model/E_service");

TestController = {}

TestController.test = async (req, res) => {
  try{
    let maincount = []
    keywords = await new Keyword().get();
    services = await new Service().get();
    e_services = await new E_service().get();
    mains = await new Main().get();

    
    for(const key of keywords){
      for(const service of services){
        try{
          data = await new Main().getKeywordCount(service.id ,key.id);
        if (data > 0){        
          obj = {service: service.name , keyword:key.word , count: data}
          maincount.push(obj);
        }
      }catch(error){
        console.log(error,"error count")
      }
      }
    }
    
    // const shopee =maincount.filter(service => service.service === "Shopee")
    const lodash = l.groupBy(maincount,"service")
    res.json( {lodash , keywords } );

  }catch(error){
    console.log(error,"error")
  }
}

module.exports = TestController;