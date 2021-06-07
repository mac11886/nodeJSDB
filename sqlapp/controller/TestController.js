const Amazon = require("../model/Amazon");
const Job = require("../model/Job");
const Shopee = require("../model/Shopee");

TestController = {}

TestController.test = async (req, res) => {
    const object = {
        name: 'Study Notes เคมี ม.ปลาย สไตล์ Cornell 2',
        price: '247',
        type: 'general',
        star: '0.0',
        sold: 'no sold',
        send_from: 'จังหวัดกรุงเทพมหานคร',
        img_src: 'https://cf.shopee.co.th/file/be2b5e0f54cbea4228be9429d013378f_tn',
        url: 'https://shopee.co.th//Study-Notes-เคมี-ม.ปลาย-สไตล์-Cornell-2-i.55217237.4361443615',
        product_id: '3361443615'
      }
    // const shopee = new Shopee();
    // await shopee.saveEcom(object, "jjj")
    // await shopee.saveEcom(object, "jjj")
    // res.json(object)
    res.render("status.ejs", { objectJson: object });
}

module.exports = TestController