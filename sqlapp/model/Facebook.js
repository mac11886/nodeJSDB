const Model = require("./model");

class Facebook extends Model {
    constructor(){
        super("facebook","post_id",5)
    }
    getEmptyObj(){
        return {
            id: null,
            job_id:	null,
            user_name: null,
            comment: null,
            date: null,
            image_h: null,
            image_l: null,
            reaction: null,
            post_url: null,
            post_id: null,
            post_text: null,
            meaning: null,
            good_word: null,	
            bad_word: null	
        }
    }
}

module.exports = Facebook