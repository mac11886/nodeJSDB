const Model = require("./model");

class E_Service extends Model {
    constructor(){
        super("e_service")
    }
    getEmptyObj(){
        return {
            id : null,
            service_id : null,
            e_id : null,
        }
    }
}

module.exports = E_Service