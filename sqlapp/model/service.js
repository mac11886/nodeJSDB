const Model = require("./model");

class Service extends Model {
    constructor(){
        super("service")
    }
    getEmptyObj(){
        return {
            id : null,
            service : null
        }
    }
}

module.exports = Service