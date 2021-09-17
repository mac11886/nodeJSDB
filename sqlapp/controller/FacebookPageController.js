const Facebook_page_model = require("../model/Facebook_page.model")
FacebookPageController = {}

FacebookPageController.get = async (req, res) => {
    let facebook_pages = await Facebook_page_model.findAll();
    res.json(facebook_pages);
}


FacebookPageController.post = async (req, res) => {
    let name = req.body.name;
    let page_id = req.body.page_id
    await Facebook_page_model.create({
        name:name,
        page_id: page_id
    });
}

FacebookPageController.delete = async (req, res) => {
    let id = req.body.id;
    // console.log(id);
    await Facebook_page_model.destroy({where:{id:id}});
    // console.log(facebook_page);
    res.json("del succ")
}


    module.exports = FacebookPageController;
