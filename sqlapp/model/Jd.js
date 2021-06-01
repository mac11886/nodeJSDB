const Model = require("./model");

class JD extends Model {
    constructor(){
        super("jd", "product_id", 4)
    }
    getEmptyObj(){
        return {
            id : null,
            job_id : null,
            product_id : null,
            name : null,
            price : null,
            img_src : null,
            type : null,
            review : null,
            send_from : null
        }
    }
}

module.exports = JD