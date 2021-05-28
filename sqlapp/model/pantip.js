const Model = require("./model");

class Pantip extends Model {
    constructor(){
        super("pantip")
    }
    getEmptyObj(){
        return {
            id: null,
            job_id:	null,
            title: null,
            author: null,
            author_id: null,
            story: null,
            like_count: null,
            emo_count: null,
            allemos: null,
            tags: null,
            date_time: null,
            post_link: null,
            img_src: null,
            post_id: null,
            meaning: null,
            good_word: null,	
            bad_word: null	
        }
    }
}

module.exports = Pantip