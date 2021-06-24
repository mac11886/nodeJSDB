const Model = require("../model/Model")

class Facebook extends Model {
    constructor(){
        super("facebook","post_id", 5)
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

    searchKeywordCount(keyword){
        console.log("search",keyword)
        return new Promise(function(resolve, reject){
            this.mysqlConnect.query(`SELECT COUNT(*) FROM facebook WHERE post_text LIKE '%${keyword}%'`, (err, results) => {
                console.log(Object.values(results[0])[0])
                if (err) {
                    reject(null);
                }
                resolve(Object.values(results[0])[0]);
            });
        });
    }
}

module.exports = Facebook