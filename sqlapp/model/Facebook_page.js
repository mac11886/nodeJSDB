const Model = require("./model");

class Facebook_page extends Model {
    constructor(){
        super("facebook_page");
    }
    insert(name) {
        return new Promise((resolve, reject) => {
            this.mysqlConnect.query(`INSERT INTO ${this.table}(name) VALUES ('${name}')`, (err, results) => {
                if (err) {
                    return reject(err);
                }
                console.log(results);
                return resolve("add success");
            });
            this.mysqlConnect.end();
        });
    }
}

module.exports = Facebook_page;