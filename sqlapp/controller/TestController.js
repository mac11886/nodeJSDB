const Amazon = require("../model/Amazon");
const Job = require("../model/Job");
const Model = require("../model/model");
const Shopee = require("../model/Shopee");

TestController = {}

TestController.test = async (req, res) => {
  try{
    var maincount = []
    keywords = await new Model("keyword").get();
    
    for(const x of keywords){
      
      data = await new Model("main").getcount(x.id);
      maincount.push(data)
    }
    console.log(maincount)
    console.log(maincount[0])

    // count = await data.getcount(77);
    // console.log(count)
    // const shopee = new Shopee();
    // await shopee.saveEcom(object, "jjj")
    // await shopee.saveEcom(object, "jjj")
    // res.json(object)
    res.render("status.ejs", { maincount ,keywords });
  }catch(error){
    console.log(error,"error count")
  }
}

module.exports = TestController