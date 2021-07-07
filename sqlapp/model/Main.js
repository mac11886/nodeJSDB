const Model = require("./model");

class Main extends Model {
    constructor(){
        super("main")
    }
    getEmptyObj(){
        return {
            id : null,
            keyword : null,
            service : null,
            page : null,
        }
    }

    
}

module.exports = Main