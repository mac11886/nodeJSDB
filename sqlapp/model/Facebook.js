const { reject } = require("lodash");
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

    searchKeywordCount(thai_word,eng_word){
        return new Promise((resolve, reject) => {
            this.mysqlConnect.query(`SELECT COUNT(*) FROM facebook WHERE post_text LIKE '%${thai_word}%' OR '%${eng_word}%'`, (err, results) => {
                if (err) {
                    reject(null);
                }
                resolve(Object.values(results[0])[0]);
            });
        });
    }

    searchKeywordAll(thai_word,eng_word){
        return new Promise((resolve,reject) =>{
            this.mysqlConnect.query(`SELECT * FROM facebook WHERE post_text LIKE '%${thai_word}%' OR '%${eng_word}%'`,(err,results) =>{
                if(err){
                    reject(null);
                }
                resolve(results)
            })
        });
    }
}

module.exports = Facebook