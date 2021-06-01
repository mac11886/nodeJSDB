const mysql = require("mysql");

class Model {
    constructor(table, pk, serviceId) {
        this.table = table
        this.pk = pk
        this.serviceId = serviceId
        this.mysqlConnect = mysql.createConnection({
            // connectionLimit: 10,
            password: "",
            user: "root",
            database: "ecom_db",
            host: "localhost",
        });
        this.mysqlConnect.connect((err) => {
            if (!err) console.log("DB connection success");
            else console.log("DB connect fail");
        });
    }
    get(sortType) {
        // return (`select * from ` + [this.table])
        return new Promise((resolve, reject) => {
            this.mysqlConnect.query(`select * from ` + this.table + " order by id " + (sortType ? sortType : ""), (err, results) => {
                if (err) {
                    return reject(null);
                }
                return resolve(results);
            });
        });
    }
    getLastOne() {
        return new Promise((resolve, reject) => {
            this.mysqlConnect.query(`select * from ` + this.table + " order by id DESC limit 1 ", (err, results) => {
                if (err) {
                    return reject(null);
                }
                return resolve(results);
            });
        });
    }

    first() {
        return new Promise((resolve, reject) => {
            this.mysqlConnect.query(`select * from ` + this.table + " limit 1", (err, results) => {
                if (err) {
                    return reject(null);
                }
                return resolve(results);
            });
        });
    }

    save(objectParam) {
        return new Promise((resolve, reject) => {
            console.log(objectParam)
            // let query = ""
            // let object = objectParam
            // Object.keys(object).forEach(function (key) {
            //     if (key != "id" ) {
            //         query += `${key}="${object[key].trim()}",`
            //     }
            // })
            // query = query.substring(0, query.length - 1);
            // console.log(`insert into ${this.table} set ${query}`)
            this.mysqlConnect.query(`insert into ${this.table} set ?`, objectParam, (err, results) => {
                if (err) {
                    return reject(err);
                }
                return resolve("add success");
            });
        });
    }
    async saveEcom(objectParam, word) {
        // console.log(object)
        let keywords = await new Promise((resolve, reject) => {
            this.mysqlConnect.query(`select * from keyword where word='${word}'`, (err, results) => {
                if (err) {
                    return reject(err);
                }
                return resolve(results);
            });
        });
        if (keywords.length == 0) {
            await new Promise((resolve, reject) => {
                this.mysqlConnect.query(`insert into keyword set ?`, [{"word": word}], (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve("yes");
                });
            });
        }
        
        const joinData = await new Promise((resolve, reject) => {
            this.mysqlConnect.query(`SELECT * FROM main JOIN e_service on main.e_service_id = e_service.id AND e_service.service_id=${this.serviceId} JOIN ${this.table} on e_service.e_id = ${this.table}.id WHERE ${this.table}.${this.pk}="${objectParam[this.pk]}"`, (err, results) => {
                if (err) {
                    return reject(err);
                }
                return resolve(results);
            });
        });
        if (joinData.length == 0){
            new Promise((resolve, reject) => {
                this.mysqlConnect.query(`insert into ${this.table} set ?`, objectParam, (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve("yes");
                });
            });
            // const dataEcom = new Promise((resolve, reject) => {
            //     this.mysqlConnect.query(`select * from ${this.table} order by id desc limit 1`, (err, results) => {
            //         if (err) {
            //             return reject(err);
            //         }
            //         return resolve(results);
            //     });
            // });
            new Promise((resolve, reject) => {
                this.mysqlConnect.query(`insert into e_service set ?`, [{"service_id":this.serviceId}], (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(results);
                });
            });
            new Promise((resolve, reject) => {
                this.mysqlConnect.query(`update e_service join ${this.table} on e_service.e_id = 0 set e_service.e_id = ${this.table}.id ORDER BY ${this.table}.id desc`, objectParam, (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve("yes");
                });
            });
            // const dataEService = new Promise((resolve, reject) => {
            //     this.mysqlConnect.query(`select * from e_service order by id desc limit 1`, (err, results) => {
            //         if (err) {
            //             return reject(err);
            //         }
            //         return resolve(results);
            //     });
            // });
            new Promise((resolve, reject) => {
                this.mysqlConnect.query(`insert into main set ?`, [{"e_service_id":0, "key_id": 0 }], (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve("yes");
                });
            });
            const updateKeyId =`update main join keyword on main.key_id = 0 AND keyword.word="${word}" set main.key_id = keyword.id`;
            const updateServiceId = "update main join e_service on main.e_service_id = 0 set main.e_service_id = e_service.id ORDER BY e_service.id desc";
            new Promise((resolve, reject) => {
                this.mysqlConnect.query(updateKeyId, objectParam, (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve("yes");
                });
            });
            new Promise((resolve, reject) => {
                this.mysqlConnect.query(updateServiceId, objectParam, (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve("yes");
                });
            });
            // console.log(status)
        }
        // return new Promise((resolve, reject) => {
        //     const service = this.where("name=${}")
        // });
    }

    update(objectParam) {
        return new Promise((resolve, reject) => {
            let object = objectParam
            let query = ""
            Object.keys(object).forEach(function (key) {
                if (key != "id") {
                    query += `${key}='${object[key]}',`
                }
            })
            query = query.substring(0, query.length - 1);
            // console.log(`update ${this.table} set ${query} where id=${object["id"]}`)
            this.mysqlConnect.query(`update ${this.table} set ${query} where id=${object["id"]}`, (err, results) => {
                if (err) {
                    return reject(null);
                }
                return resolve("edit success");
            });
        });
    }
    updateJobId(jobId) {
        return new Promise((resolve, reject) => {
            this.mysqlConnect.query(`update  ` + this.table + ` set job_id=${jobId} where job_id=0`, (err, results) => {
                if (err) {
                    return reject(err);
                }
                return resolve(results);
            });
        });
    }
    delete(id) {
        return new Promise((resolve, reject) => {
            this.mysqlConnect.query(`delete from ${this.table} where id=${id}`, (err, results) => {
                if (err) {
                    return reject(null);
                }
                return resolve("delete success");
            });
        });
    }
    where(condition) {
        console.log(`select * from ${this.table} where ${condition}`)
        return new Promise((resolve, reject) => {
            this.mysqlConnect.query(`select * from ${this.table} where ${condition}`, (err, results) => {
                if (err) {
                    return reject(null);
                }
                return resolve(results);
            });
        });
    }

}

module.exports = Model