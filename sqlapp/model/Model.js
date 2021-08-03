const { reject, range } = require("lodash");
// const mysql = require("mysql2");
const { getMysqlConnect } = require("../db")

class Model {

    constructor(table, pk, serviceId) {
        this.table = table
        this.pk = pk
        this.serviceId = serviceId
        this.mysqlConnect = getMysqlConnect()
        // this.mysqlConnect = mysql.createPool({
        //     // connectionLimit: 500,
        //     password: process.env.DATABASE_PASSWORD,
        //     user: process.env.DATABASE_USER,
        //     database: process.env.DATABASE_NAME,
        //     host: process.env.DATABASE_HOST,
        // });
        // this.mysqlConnect.getConnection((err) => {
        //     if (!err) console.log("DB connection success");
        //     else console.log("DB connect fail", err);

        // });
    }
    connect = () => new Promise((resolve) => {
        // this.mysqlConnect.getConnection((err) => {
        //     if (!err) console.log("DB connection success");
        //     else console.log("DB connect fail",err);
        // });
    })

    get(sortType) {
        // this.connect()
        return new Promise(async (resolve, reject) => {

            this.mysqlConnect.query(`select * from ` + this.table + " order by id " + (sortType ? sortType : ""), (err, results) => {
                if (err) {
                    return reject(null);
                }
                resolve(results);
            });
        });
    }
    // getCount() {
    //     return new Promise((resolve, reject) => {
    //         this.mysqlConnect.query(`select count(key_id) from ` + this.table, (err, results) => {
    //             if (err) {
    //                 return reject(null);
    //             }
    //             return resolve(Object.values(results[0])[0]);
    //         });
    //     });
    // }
    getKeywordCount(service_id, key_id) {
        // this.connect()
        return new Promise((resolve, reject) => {
            this.mysqlConnect.query(`SELECT count(*) FROM keyword INNER JOIN main ON keyword.id = main.key_id INNER JOIN e_service ON e_service.id = main.e_service_id WHERE e_service.service_id = ${service_id} AND keyword.id = ${key_id}`, (err, results) => {
                if (err) {
                    reject(err.message);
                }
                resolve(Object.values(results[0])[0]);
            });
        });
    }
    getproductbykeyword(service, id, service_id) {
        return new Promise((resolve, reject) => {
            this.mysqlConnect.query(`SELECT * FROM ${service} INNER JOIN e_service ON ${service}.id = e_service.e_id AND e_service.service_id = ${service_id} INNER JOIN main ON e_service.id = main.e_service_id WHERE main.key_id = ${id}`, (err, results) => {
                if (err) {
                    return reject(err.message);
                }
                return resolve(results);
            });
        });
    }
    getLastOne() {
        // this.connect()
        return new Promise((resolve, reject) => {
            this.mysqlConnect.query(`select * from ` + this.table + " order by id DESC limit 1 ", (err, results) => {
                if (err) {
                    return reject(err.message);
                }
                return resolve(results);
            });
            // this.mysqlConnect.end() 
        });
    }

    first() {
        // this.connect()
        return new Promise((resolve, reject) => {
            this.mysqlConnect.query(`select * from ` + this.table + " limit 1", (err, results) => {
                if (err) {
                    return reject(null);
                }
                return resolve(results);
            });
            // this.mysqlConnect.end() 
        });
    }


    getcount() {
        // this.connect()
        return new Promise((resolve, reject) => {
            this.mysqlConnect.query(`select count(*) from ` + this.table, (err, results) => {
                if (err) {
                    return reject(err.message);
                }
                return resolve(Object.values(results[0])[0]);
            });
            // this.mysqlConnect.end() 
        });
    }

    getkeywordcount(service_id, key_id) {
        // this.connect()
        return new Promise((resolve, reject) => {
            this.mysqlConnect.query(`SELECT count(*) FROM keyword INNER JOIN main ON keyword.id = main.key_id INNER JOIN e_service ON e_service.id = main.e_service_id WHERE e_service.service_id = ${service_id} AND keyword.id = ${key_id}`, (err, results) => {
                if (err) {
                    return reject(err.message);
                }
                return resolve(Object.values(results[0])[0]);
            });
            // this.mysqlConnect.end() 
        });
    }

    keywordfiller(id) {
        // this.connect()
        return new Promise((resolve, reject) => {
            this.mysqlConnect.query(`SELECT count(*) FROM keyword INNER JOIN main ON keyword.id = main.key_id INNER JOIN e_service ON e_service.id = main.e_service_id WHERE keyword.id = '${id}'`, (err, results) => {
                if (err) {
                    return reject(err.message);
                }
                return resolve(results);
            });
            // this.mysqlConnect.end() 
        });
    }
    // async check_product(id){
    //     return new Promise((resolve, reject) => {
    //         this.mysqlConnect.query(`select * from ${this.table} where ${this.pk} = '${id}' `, (err, results) => {
    //             if (err) {
    //                 return reject(err);
    //             }
    //             if (results.length > 1){
    //                 console.log(results)
    //             }
                
    //             resolve(results.length);
    //         });
    //     });

    // }
    async check_product(id){
        return new Promise((resolve, reject) => {
            this.mysqlConnect.query(`select * from ${this.table} where ${this.pk} = '${id}' `, (err, results) => {
                if (err) {
                    return reject(err);
                }
                if (results.length > 1){
                    console.log(results)
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
                console.log(error, "error select keyword")
            }
        }
    }

    update_product(objectParam , keyword_id ,service_id) {
        return new Promise(async(resolve, reject) => {
            try{
            console.log("update..")
            //get id from this table
            const id = await this.whereGet(`SELECT id FROM ${this.table} WHERE ${this.pk} = '${objectParam[this.pk]}'`)
            //update data by id has get brfore
            await this.updateById(`UPDATE ${this.table} SET  ?   WHERE id = '${id[0]}'` , objectParam) 
            if(service_id != 5){
            //use id , service_id to get e_service_id in e_service table
            const e_service_id = await this.whereGet(`SELECT id FROM e_service WHERE e_id = '${id[0]}' AND service_id = '${service_id}'`)
            //use e_service_id to count those seem e_service_id and key_id
            const found_key_id = await this.whereGet(`SELECT count(*) FROM main WHERE e_service_id = '${e_service_id}' AND key_id = '${keyword_id}'`)
            console.log("found key id =" , found_key_id)
            if(found_key_id == 0){ //if this keyword_id not in main table --> insert new row
                await this.insertMainTable(`INSERT INTO main SET e_service_id = ${e_service_id},key_id = ${keyword_id}`)
            }
        }

            }catch(error){
                console.log(error)
                reject()
            }
            resolve()
            
        });
    }


    updateById = (queryString,objectParam) => new Promise((resolve,reject) => {
        this.mysqlConnect.query(`${queryString}`,objectParam ,(err,result) => {
            if(err){
                console.log(err)
                reject()
            }
            resolve(result)
        })
    })

    whereGet = (queryString,objectParam) => new Promise((resolve,reject) => {
        this.mysqlConnect.query(`${queryString}`,(err,result) => {
            if(err){
                console.log(err)
                reject()
            }
             resolve(Object.values(JSON.parse(JSON.stringify(result[0]))))
        })
    })

    
    // update_product(objectParam) {
    //     return new Promise((resolve, reject) => {
    //         console.log("update..")
    //         this.mysqlConnect.query(` UPDATE ${this.table} SET  ?   WHERE ${this.pk} = '${objectParam[this.pk]}'`, objectParam, (err) => {
    //             if (err) {
    //                 return reject(err);
    //             }
    //             resolve("add success");
    //         });
    //     });
    // }
    saveEcom(objectParam, word) {
        return new Promise(async (resolve) => {
            console.log("saving data to DB")
            try {
                    const insertId = await this.insertTable(`insert into ${this.table} set ? ;`, objectParam)
                    const e_id = await this.insertTable("insert into `e_service` (`service_id`,`e_id`) VALUES (" + this.serviceId + "," + insertId + ")")
                    if (this.table != "facebook") {
                        const key_id = await this.selectKeyword(`select id from keyword where thai_word = "${word}" or eng_word = "${word}"`)
                        await this.insertMainTable(`insert into main set e_service_id = ${e_id},key_id = ${key_id}`)
                }
                // this.mysqlConnect.end()
            } catch (err) {
                if (err.code == "PROTOCOL_CONNECTION_LOST") {
                    this.connect()
                } else {
                    console.log("save ecom", err)
                }
            }
            resolve()
        }
        )
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


    // update(objectParam) {
    //     return new Promise((resolve, reject) => {
    //         // this.mysqlConnect.connect();
    //         let object = objectParam
    //         let query = ""
    //         Object.keys(object).forEach(function (key) {
    //             if (key != "id") {
    //                 query += `${key}='${object[key]}',`
    //             }
    //         })
    //         query = query.substring(0, query.length - 1);

    //         this.mysqlConnect.query(`update ${this.table} set ${query} where id=${object["id"]}`, (err, results) => {
    //             if (err) {
    //                 return reject(null);
    //             }
    //             return resolve("edit success");
    //         });
    //         // this.mysqlConnect.end() 
    //     });
    // }
    updateJobId(jobId) {
        return new Promise((resolve, reject) => {
            this.mysqlConnect.query(`update  ` + this.table + ` set job_id=${jobId} where job_id IS NULL`, (err, results) => {
                if (err) {
                    return reject(err);

                }

                resolve(results);
            });
            // this.mysqlConnect.end() 
        });
    }

    delete(id) {
        // this.connect()
        return new Promise((resolve, reject) => {
            this.mysqlConnect.query(`delete from ${this.table} where id=${id}`, (err, results) => {
                if (err) {
                    return reject(null);
                }

                return resolve("delete success");
            });
            // this.mysqlConnect.end() 
        });
    }
    where(condition) {
        // this.connect()
        return new Promise((resolve, reject) => {
            this.mysqlConnect.query(`select * from ${this.table} where ${condition}`, (err, results) => {
                if (err) {
                    return reject(null);
                }

                return resolve(results);
            });
            // this.mysqlConnect.end() 
        });
    }
    wherecount(condition) {
        // this.connect()
        return new Promise((resolve, reject) => {
            this.mysqlConnect.query(`select count(*) from ${this.table} where ${condition}`, (err, results) => {
                if (err) {
                    return reject(null);
                }

                return resolve(Object.values(results[0])[0]);
            });
            // this.mysqlConnect.end() 
        });
    }

    close = () => new Promise((resolve, reject) => {
        // this.mysqlConnect.end()
        // console.log("disconnect db")
    });

    addJob = (req) => {
        return new Promise((resolve, reject) => {
            // this.mysqlConnect.connect();
            this.mysqlConnect.query(`insert into job set ?`, req, async (err, results) => {
                if (err) {
                    return reject(err);
                }
                let data = await new Promise((resolve, reject) => {
                    this.mysqlConnect.query(
                        `SELECT * FROM job ORDER BY ID DESC LIMIT 1`, (err, results) => {
                            if (err) {
                                return reject(err);
                            }
                            return resolve(results);
                        }
                    );
                });
                // this.mysqlConnect.end();
                resolve(data[0]);
            });
        });
    };

      updateJob = (id,status) => {
        return new Promise(async(resolve, reject) => {
            let date = new Date(); // Or the date you'd like converted.
            let isoDateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ');
            console.log("updating job")
        if(status === "success" || status === "error"){
          this.mysqlConnect.query(`update job set end_time = ?, status="${status}" where id = ? `,
            [isoDateTime, id],
            (err, results) => {
              if (err) {
                return reject(err);
              }
              resolve();
            });
        }else{
            this.mysqlConnect.query(`update job set start_time = ?, status="${status}" where id = ?`,
            [isoDateTime,id],
            (err, results) => {
              if (err) {
                return reject(err);
              }
              resolve();
            });
        }

        });
    };

    all = () => {
        return new Promise((resolve, reject) => {
            // this.mysqlConnect.connect();
            this.mysqlConnect.query(`select * from job`, (err, results) => {
                if (err) {
                    return reject(err);
                }

                return resolve(results);
            });
            //   this.mysqlConnect.end()
        });
    };


}

module.exports = Model;