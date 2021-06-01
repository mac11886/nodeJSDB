const Model = require("./model");

class Amazon extends Model {
    constructor(){
        super("amazon", "product_id", 2)
    }
    getEmptyObj(){
        return {
            id : null,
            job_id : null,
            product_id : null,
            name : null,
            price : null,
            rating : null,
            review : null,
            img_src : null,
            url : null,
            rank : null
        }
    }
}

module.exports = Amazon