const Model = require("./model");

class Job extends Model {
    constructor(){
        super("job")
    }
    getEmptyObj(){
        return {
            id : null,
            keyword : null,
            service : null,
            page : null,
            status : null,
            path_file : null,
            start_time : null,
            end_stime : null,
        }
    }
}

module.exports = Job