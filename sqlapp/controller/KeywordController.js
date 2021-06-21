const Keyword = require("../model/Keyword");

KeywordController = {}

KeywordController.get = async (req, res) => {
    let keywords = await new Keyword().get();
    res.json( { keywords } );

}

KeywordController.post = async (req, res) => {


}

KeywordController.delete = async (req, res) => {


}

module.exports = KeywordController ;