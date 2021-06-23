const Facebook_page = require("../model/Facebook_page");

FacebookPageController = {}

FacebookPageController.get = async (req, res) => {

    let facebook_pages = await new Facebook_page().get();
    res.json( { facebook_pages } );
}

FacebookPageController.post = async (req, res) => {
    let page = req.body.name;
    let facebook_page = await new Facebook_page().insert(page);
    console.log(facebook_page);
}

FacebookPageController.delete = async (req, res) => {
    let id = req.body.id;
    // console.log(id);
    let facebook_page = await new Facebook_page().delete(id);
    // console.log(facebook_page);
}



module.exports = FacebookPageController ;