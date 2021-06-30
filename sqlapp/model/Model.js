const mysql = require("mysql2");

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
            host: "127.0.0.1",
        });
        this.mysqlConnect.connect((err) => {
            if (!err) console.log("DB connection success");
            else console.log("DB connect fail");
        });
    }

    get(sortType) {
        return new Promise((resolve, reject) => {
            this.mysqlConnect.query(`select * from ` + this.table + " order by id " + (sortType ? sortType : ""), (err, results) => {
                if (err) {
                    return reject(null);
                }
                return resolve(results);
            });
            this.mysqlConnect.end()
        });
    }
    getCount() {
        return new Promise((resolve, reject) => {
            this.mysqlConnect.query(`select count(key_id) from ` + this.table, (err, results) => {
                if (err) {
                    return reject(null);
                }
                return resolve(Object.values(results[0])[0]);
            });
            this.mysqlConnect.end()
        });
    }

    getLastOne() {
        return new Promise((resolve, reject) => {
            this.mysqlConnect.query(`select * from ` + this.table + " order by id DESC limit 1 ", (err, results) => {
                if (err) {
                    return reject(err.message);
                }
                return resolve(results);
            });
            this.mysqlConnect.end()
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
            this.mysqlConnect.end()
        });
    }

    save(objectParam) {
        return new Promise((resolve, reject) => {
            // console.log(objectParam)

            this.mysqlConnect.query(`insert into ${this.table} set ?`, objectParam, (err, results) => {
                if (err) {
                    return reject(err);
                }
                return resolve("add success");
            });
            this.mysqlConnect.end()
        });
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

            this.mysqlConnect.query(`update ${this.table} set ${query} where id=${object["id"]}`, (err, results) => {
                if (err) {
                    return reject(null);
                }
                return resolve("edit success");
            });
            this.mysqlConnect.end()
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
            this.mysqlConnect.end()
        });
    }
    where(condition) {
        return new Promise((resolve, reject) => {
            this.mysqlConnect.query(`select * from ${this.table} where ${condition}`, (err, results) => {
                if (err) {
                    return reject(null);
                }
                return resolve(results);
            });
        });

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

            this.mysqlConnect.query(`update ${this.table} set ${query} where id=${object["id"]}`, (err, results) => {
                if (err) {
                    return reject(null);
                }
                return resolve("edit success");
            });
            // this.mysqlConnect.end() 
        });
    }


    updateJobId(jobId) {
        return new Promise((resolve, reject) => {
            this.mysqlConnect.query(`update  ` + this.table + ` set job_id=${jobId} where job_id IS NULL`, (err, results) => {
                if (err) {
                    return reject(err);
                }
                return resolve(results);
            });
            // this.mysqlConnect.end() 
        });
    }






    async saveEcom(objectParam, word) {
        return new Promise(async (resolve) => {
            this.mysqlConnect.connect();
            console.log("saving data to DB")
            try {
                const found = await this.joinData(`SELECT * FROM main JOIN e_service on main.e_service_id = e_service.id AND e_service.service_id=${this.serviceId} JOIN ${this.table} on e_service.e_id = ${this.table}.id WHERE ${this.table}.${this.pk}="${objectParam[this.pk]}"`, objectParam)

                if (found.length == 0) {
                    const insertId = await this.insertTable(`insert into ${this.table} set ? ;`, objectParam)
                    const e_id = await this.insertTable("insert into `e_service` (`service_id`,`e_id`) VALUES (" + this.serviceId + "," + insertId + ")")
                    if (this.table != "facebook") {
                        const key_id = await this.selectKeyword(`select id from keyword where thai_word = "${word}" or eng_word = "${word}"`)
                        await this.insertMainTable(`insert into main set e_service_id = ${e_id},key_id = ${key_id}`)
                    }

                    resolve()
                }

            } catch (err) {
                console.log(err)
            }
        })
    }


    joinData = (queryString, objectParam) => new Promise((resolve, reject) => {
        this.mysqlConnect.query(`${queryString}`, objectParam, (err, results) => {
            if (err) {
                console.log("joindata", err)
                reject(err);
            }
            resolve(results);
        });
    });

    insertTable = (queryString, objectParam) => new Promise((resolve, reject) => {
        this.mysqlConnect.query(`${queryString}`, objectParam, (err, results) => {
            if (err) {
                console.log("insert", err)
                reject(err);
            }
            resolve(results.insertId);
        });
    });


    selectKeyword = (queryString) => new Promise((resolve) => {
        this.mysqlConnect.query(`${queryString}`, (err, result) => {
            if (err) {
                console.log("selectkeword", err)
                reject(err);
            }
            resolve(result[0].id);
        })
    })

    insertMainTable = (queryString) => new Promise((resolve, reject) => {
        this.mysqlConnect.query(`${queryString}`, (err, results) => {
            if (err) {
                console.log("insertmain", err)
                reject(err);
            }
            resolve();
        });
    })







    async check(thai_word, eng_word) {
        let result = await new Promise((resolve, reject) => {
            this.mysqlConnect.query(`select * from keyword where thai_word='${thai_word}' or eng_word= '${eng_word}'`, (err, results) => {
                if (err) {
                    return reject(err);
                }
                return resolve(results);
            });
        });

        if (result.length == 0) {
            try {
                await new Promise((resolve, reject) => {
                    this.mysqlConnect.query(`insert into keyword (thai_word,eng_word) values ('${thai_word}','${eng_word}')`, (err, results) => {
                        if (err) {
                            return reject(err);
                        }
                        return resolve("yes");
                    });
                });
            } catch (error) {
                console.log(error, "erron select keyword")
            }
        }
    }
    getKeywordCount(service_id, key_id) {
        return new Promise((resolve, reject) => {
            this.mysqlConnect.query(`SELECT count(*) FROM keyword INNER JOIN main ON keyword.id = main.key_id INNER JOIN e_service ON e_service.id = main.e_service_id WHERE e_service.service_id = ${service_id} AND keyword.id = ${key_id}`, (err, results) => {
                if (err) {
                    reject(err.message);
                }
                resolve(Object.values(results[0])[0]);
            });
            this.mysqlConnect.end()
        });
    }

    getProductByKeyword(service, id, service_id) {
        return new Promise((resolve, reject) => {
            this.mysqlConnect.query(`SELECT * FROM ${service} INNER JOIN e_service ON ${service}.id = e_service.e_id AND e_service.service_id = ${service_id} INNER JOIN main ON e_service.id = main.e_service_id WHERE main.key_id = ${id}`, (err, results) => {
                if (err) {
                    return reject(err.message);
                }
                return resolve(results);
            });

            this.mysqlConnect.end()
        });
    }
    keywordFiller(id) {
        return new Promise((resolve, reject) => {
            this.mysqlConnect.query(`SELECT count(*) FROM keyword INNER JOIN main ON keyword.id = main.key_id INNER JOIN e_service ON e_service.id = main.e_service_id WHERE keyword.id = '${id}'`, (err, results) => {
                if (err) {
                    return reject(err.message);
                }
                return resolve(results);
            });
            this.mysqlConnect.end()
        });
    }

    async check_product(id, type_id) {
        return new Promise((resolve, reject) => {
            this.mysqlConnect.query(`select * from ${this.table} where ${type_id} = '${id}' `, (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results.length);
            });
        });

    }

    async check(thai_word, eng_word) {
        let result = await new Promise((resolve, reject) => {
            this.mysqlConnect.query(`select * from keyword where thai_word='${thai_word}' or eng_word= '${eng_word}'`, (err, results) => {
                if (err) {
                    return reject(err);
                }
                return resolve(results);
            });
        });
        if (result.length == 0) {
            try {
                await new Promise((resolve, reject) => {
                    this.mysqlConnect.query(`insert into keyword (thai_word,eng_word) values ('${thai_word}','${eng_word}')`, (err, results) => {
                        if (err) {
                            return reject(err);
                        }
                        return resolve("yes");
                    });
                });
            } catch (error) {
                console.log(error, "erron select keyword")
            }
        }
    }

    async update_product(objectParam, type_id) {
        return new Promise((resolve, reject) => {

            this.mysqlConnect.connect();
            console.log("update..")
            this.mysqlConnect.query(` UPDATE ${this.table} SET  ?   WHERE ${type_id} = '${objectParam[this.pk]}' `, objectParam, (err, results) => {
                if (err) {
                    return reject(err);
                }
                console.log(results)
                resolve("add success");
            });
        });
    }

    testForModel() {
        [1, 2, 3, 4, 5].forEach((el) => {
            this.mysqlConnect.query(`insert into e_service set e_id = 1`, (err, result) => {
                console.log("pass1")
            })
            this.mysqlConnect.query(`insert into e_service set e_id = 1`, (err, result) => {
                console.log("pass2")
            })
            this.mysqlConnect.query(`insert into e_service set e_id = 1`, (err, result) => {
                console.log("pass3")
            })
        })
    }
    close() {
        this.mysqlConnect.end();
    }



}

module.exports = Model;