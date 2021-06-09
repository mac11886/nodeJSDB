const db = require("../db");
const fs = require("fs");
const utf8 = require("utf8");
const Amazon = require("../model/Amazon");
const Shopee = require("../model/Shopee");
const Job = require("../model/Job");
const Pantip = require("../model/Pantip");
const Jd = require("../model/Jd");
const Facebook = require("../model/Facebook");
const Keyword = require("../model/Keyword");
const Model = require("../model/Model")
const { resolve } = require("path");
const { rejects } = require("assert");

TestController = {}

TestController.test = async (req, res) => {
  main = new Model("main");
  result = await main.getCount();
  // console.log(result['id'])
    // const object = {
    //     name: 'Study Notes เคมี ม.ปลาย สไตล์ Cornell 2',
    //     price: '247',
    //     type: 'general',
    //     star: '0.0',
    //     sold: 'no sold',
    //     send_from: 'จังหวัดกรุงเทพมหานคร',
    //     img_src: 'https://cf.shopee.co.th/file/be2b5e0f54cbea4228be9429d013378f_tn',
    //     url: 'https://shopee.co.th//Study-Notes-เคมี-ม.ปลาย-สไตล์-Cornell-2-i.55217237.4361443615',
    //     product_id: '3361443615'
    //   }
    
    // const shopee = new Shopee();
    // await shopee.saveEcom(object, "jjj")
    // await shopee.saveEcom(object, "jjj")
    res.render("status.ejs", { title: "Job", name: "mac", object: result });
}

module.exports = TestController