const Model = require("./model");

class Keyword extends Model {
    constructor(){
        super("keyword")
    }
    getEmptyObj(){
        return {
            id : null,
            word : null,
        }
    }
}

module.exports = Keyword