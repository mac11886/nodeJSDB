const Model = require("./model");

class Service extends Model {
    constructor(){
        super("service")
    }
    getEmptyObj(){
        return {
            id : null,
            name : null
        }
    }
}

module.exports = Service