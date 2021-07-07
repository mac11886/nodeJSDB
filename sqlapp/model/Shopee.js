const Model = require("./model");

class Shopee extends Model {
    constructor(){
        super("shopee","product_id",1)
    }
    getEmptyObj(){
        return {
            id: null,
            job_id: null,
            product_id: null,
            name: null,
            price: null,
            type: null,
            star: null,
            sold: null,
            send_from: null,
            img_src: null,
            url: null	
        }
    }
}

module.exports = Shopee