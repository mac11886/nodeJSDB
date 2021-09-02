const Facebook = require("../model/Facebook");
const { getMysqlConnect } = require("../db")
const Model = require("../model/Model");

FacebookController = {}

FacebookController.get = async (req, res) => {
    let facebook = await new Facebook().get();
    res.json({ facebook });
}


FacebookController.post = async (req, res) => {
    let page = req.body.name;
    console.log(page)
    let facebook_page = await new Facebook_page().insert(page);
    console.log(facebook_page);
}

FacebookController.delete = async (req, res) => {
    let id = req.body.id;
    // console.log(id);
    let facebook_page = await new Facebook_page().delete(id);
    // console.log(facebook_page);
}

FacebookController.setC


module.exports = FacebookController;
