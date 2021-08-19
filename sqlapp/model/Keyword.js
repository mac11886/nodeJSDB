const Model = require("./model");

class Keyword extends Model {
    constructor(){
        super("keyword")
    }
    getEmptyObj(){
        return {
            id : null,
            thai_word : null,
            eng_word : null
        }
    }
}

module.exports = Keyword