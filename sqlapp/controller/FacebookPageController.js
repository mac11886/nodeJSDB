const Facebook_page = require("../model/Facebook_page");
const Model = require("../model/Model");
FacebookPageController = {}

FacebookPageController.get = async (req, res) => {
    let facebook_pages = await new Facebook_page().get();
    res.json( { facebook_pages } );
}

FacebookPageController.post = async (req, res) => {
    let page = req.body.name;
    console.log(page)
    let facebook_page = await new Facebook_page().insert(page);
    console.log(facebook_page);
}

FacebookPageController.delete = async (req, res) => {
    let id = req.body.id;
    // console.log(id);
    let facebook_page = await new Facebook_page().delete(id);
    // console.log(facebook_page);
    res.json("del succ")
}



module.exports = FacebookPageController ;
