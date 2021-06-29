const { reject, range } = require("lodash");
const mysql = require("mysql2");

class Model {
    // constructor(table, pk, serviceId) {
    //     this.table = table
    //     this.pk = pk
    //     this.serviceId = serviceId
    //     this.mysqlConnect = mysql.createConnection({
    //         connectionLimit: 10,
    //         password: "",
    //         user: "root",
    //         database: "ecom_db",
    //         host: "127.0.0.1",
    //     });
    //     this.mysqlConnect.connect((err) => {
    //         if (!err) console.log("DB connection success");
    //         else console.log("DB connect fail");
    //     });
    // }
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
            this.mysqlConnect.query(`select count(key_id) from ` + this.table , (err, results) => {
                if (err) {
                    return reject(null);
                }
                return resolve(Object.values(results[0])[0]);
            });
            this.mysqlConnect.end() 
        });
    }
    getKeywordCount(service_id,key_id){
        return new Promise((resolve, reject) => {
            this.mysqlConnect.query(`SELECT count(*) FROM keyword INNER JOIN main ON keyword.id = main.key_id INNER JOIN e_service ON e_service.id = main.e_service_id WHERE e_service.service_id = ${service_id} AND keyword.id = ${key_id}`, (err, results) => {
                if(err){
                    reject(err.message);
                }
                resolve(Object.values(results[0])[0]);
            });
            this.mysqlConnect.end() 
        });
    }
    getproductbykeyword(service,id,service_id){
        return new Promise((resolve, reject) => {
            this.mysqlConnect.query(`SELECT * FROM ${service} INNER JOIN e_service ON ${service}.id = e_service.e_id AND e_service.service_id = ${service_id} INNER JOIN main ON e_service.id = main.e_service_id WHERE main.key_id = ${id}`, (err, results) => {
                if(err){
                    return reject(err.message);
                }
                return resolve(results);
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
    

    getcount(){
        return new Promise((resolve, reject) => {
            this.mysqlConnect.query(`select count(*) from `+ this.table , (err, results) => {
                if(err){
                    return reject(err.message);
                }
                return resolve(Object.values(results[0])[0]);
            });
            this.mysqlConnect.end() 
        });
    }

    getkeywordcount(service_id,key_id){
        return new Promise((resolve, reject) => {
            this.mysqlConnect.query(`SELECT count(*) FROM keyword INNER JOIN main ON keyword.id = main.key_id INNER JOIN e_service ON e_service.id = main.e_service_id WHERE e_service.service_id = ${service_id} AND keyword.id = ${key_id}`, (err, results) => {
                if(err){
                    return reject(err.message);
                }
                return resolve(Object.values(results[0])[0]);
            });
            this.mysqlConnect.end() 
        });
    }

    keywordfiller(id){
        return new Promise((resolve,reject) => {
            this.mysqlConnect.query(`SELECT count(*) FROM keyword INNER JOIN main ON keyword.id = main.key_id INNER JOIN e_service ON e_service.id = main.e_service_id WHERE keyword.id = '${id}'`,(err,results) => {
            if(err){
                return reject(err.message);
            }
            return resolve(results);
            });
            this.mysqlConnect.end() 
        });
    }
    async check_product(id,type_id){
        return new Promise((resolve, reject) => {
            this.mysqlConnect.query(`select * from ${this.table} where ${type_id} = '${id}' `, (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results.length);
            });    
        });

    }

    

    async check(thai_word,eng_word){
        let result = await new Promise((resolve, reject) => {
                this.mysqlConnect.query(`select * from keyword where thai_word='${thai_word}' or eng_word= '${eng_word}'`, (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(results);
                });
            });

            if (result.length == 0) {
                    try{
                    await new Promise((resolve, reject) => {
                        this.mysqlConnect.query(`insert into keyword (thai_word,eng_word) values ('${thai_word}','${eng_word}')`, (err, results) => {
                            if (err) {
                                return reject(err);
                            }
                            return resolve("yes");
                        });
                    });
                }catch(error){
                    console.log(error,"erron select keyword")
                }
    }
}

    async update_product(objectParam,type_id) {
        console.log("aaaaaa",objectParam)
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
    async saveEcom(objectParam, word) {

        return new Promise (async(resolve) =>{
        this.mysqlConnect.connect();
        //save keyword 
        console.log("saving data to DB")

        const joinData = await new Promise((resolve, reject) => {
            this.mysqlConnect.query(`SELECT * FROM main JOIN e_service on main.e_service_id = e_service.id AND e_service.service_id=${this.serviceId} JOIN ${this.table} on e_service.e_id = ${this.table}.id WHERE ${this.table}.${this.pk}="${objectParam[this.pk]}"`, (err, results) => {
                if (err) {
                    return reject(err);
                }
                return resolve(results);
            }); 
        });


        if (joinData.length == 0) {
            try{
            new Promise((resolve, reject) => {
                this.mysqlConnect.query(`insert into ${this.table} set ? `, objectParam, (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    console.log("pass0")
                    resolve(results);
                })
            }).then(async () => {
                new Promise((resolve, reject) => {
                        console.log("insert + update")
                        this.mysqlConnect.query("insert into e_service set service_id = " + this.serviceId , (err, results) => {
                            if (err) {
                                console.log(err)
                                return reject();
                            }
                            console.log("PASS1")
        
        
                            resolve();
                        });
                    
                }).then(() => {
                    this.mysqlConnect.query(`update e_service set e_service.e_id = (SELECT MAX(${this.table}.id) FROM ${this.table}) ORDER BY e_service.id desc limit 1`, (err, results) => {
                        if (err) {
                            console.log(err)
                            return "reject();"
                        }
                        console.log("PASS2")
    
    
                        // resolve();
                    });
                })
            })
        }catch(error){
            console.log(error,"error joindata")
        }


        // try{
            // await new Promise((resolve, reject) => {
            //     try{
            //     console.log("insert + update")
            //     this.mysqlConnect.query("insert into e_service set service_id = " + this.serviceId + "; update e_service set e_id = 1", (err, results) => {
            //         if (err) {
            //             console.log(err)
            //             return reject();
            //         }
            //         console.log("PASS")


            //         resolve();
            //     });
            // }catch(err){
            //     reject()
            // } 
            // })
            // .then(() => {
            //     this.mysqlConnect.query(``, objectParam)
            // })
        // }catch(error){
        //     console.log(error,"query service")
        // }

        
        
        // try{
        //     await new Promise((resolve, reject) => {
        //         this.mysqlConnect.query(`update e_service set e_service.e_id = (SELECT MAX(${this.table}.id) FROM ${this.table}) ORDER BY e_service.id desc limit 1`, objectParam, (err, results) => {
        //             console.log(this.table.id)
        //             if (err) {
        //                 return reject(err);
        //             }
        //             return resolve("yes");
        //         });
        //     });
        // }catch(error){
        //     console.log(error,"error update e_service")
        // }

        try{
            await new Promise((resolve, reject) => {         
                this.mysqlConnect.query(`insert into main set ?`, [{ "e_service_id": 0, "key_id": 0 }], (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve("yes");
                });
            });
        }catch(error){
            console.log(error,"error insert into main")
        }

            const updateKeyId = `update main join keyword on main.key_id = 0 AND keyword.thai_word= "${word}" OR keyword.eng_word= "${word}" set main.key_id = keyword.id`;
            const updateServiceId = "update main join e_service on main.e_service_id = 0 set main.e_service_id = e_service.id ORDER BY e_service.id desc";

        try{
            await new Promise((resolve, reject) => {
                this.mysqlConnect.query(updateKeyId, objectParam, (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve("yes");
                });
            });
        }catch(error){
            console.log(error,"update keyword id")
        }

        try{
            await new Promise((resolve, reject) => {
                this.mysqlConnect.query(updateServiceId, objectParam, (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve("yes");
                });
            });
        }catch(error){
            console.log(error,"error update service id")
        }
            // console.log(status)
        }
        resolve()
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
    testForModel(){
        [1,2,3,4,5].forEach((el) => {
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
            this.mysqlConnect.end() 
        });
    }
    close(){
        // this.mysqlConnect.end()
    }

}

module.exports = Model;