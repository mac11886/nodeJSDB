const mysql = require("mysql");

class Model {
  updateJobId(jobId) {
    return new Promise((resolve, reject) => {
      this.mysqlConnect.query(
        `update ${this.table} set job_id=${jobId} where job_id=0 `,

        (err, results) => {
          if (err) {
            return reject(null);
          }
          return resolve(results);
        }
      );
    });
  }

  constructor(table) {
    this.table = table;
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
      this.mysqlConnect.query(
        `select * from ` +
          this.table +
          " order by id " +
          (sortType ? sortType : ""),
        (err, results) => {
          if (err) {
            return reject(null);
          }
          return resolve(results);
        }
      );
    });
  }
  getLastOne() {
    return new Promise((resolve, reject) => {
      this.mysqlConnect.query(
        `select * from ${this.table} order by id  DESC limit 1`,
        (err, results) => {
          if (err) {
            return reject(null);
          }
          return resolve(results);
        }
      );
    });
  }
  first() {
    return new Promise((resolve, reject) => {
      this.mysqlConnect.query(
        `select * from ` + this.table + " limit 1",
        (err, results) => {
          if (err) {
            return reject(null);
          }
          return resolve(results);
        }
      );
    });
  }
  getZero() {
    return new Promise((resolve, reject) => {
      this.mysqlConnect.query(
        `select * from ` + this.table + "order by job_id =0" + " DESC  ",
        (err, results) => {
          if (err) {
            return reject(null);
          }
          return resolve(results);
        }
      );
    });
  }
  save(objectParam) {
    return new Promise((resolve, reject) => {
      let query = "";
      let object = objectParam;
      Object.keys(object).forEach(function (key) {
        if (key != "id") {
          query += `${key}="${object[key]}",`;
          
        }
      });
      query = query.substring(0, query.length - 1);
      // console.log(`insert into ${this.table} set ${query}`)
      this.mysqlConnect.query(
        `insert into ${this.table} set ?`,objectParam,
        (err, results) => {
          if (err) {
            return reject(err);
          }
          return resolve("add success");
        }
      );
    });
  }

  update(objectParam) {
    return new Promise((resolve, reject) => {
      let object = objectParam;
      let query = "";
      Object.keys(object).forEach(function (key) {
        if (key != "id") {
          query += `${key}='${object[key]}',`;
        }
      });
      console.log(object);
      query = query.substring(0, query.length - 1);
      // console.log(`update ${this.table} set ${query} where id=${object["id"]}`)
      this.mysqlConnect.query(
        `update ${this.table} set ${query} where id=${object["id"]}`,
        (err, results) => {
          if (err) {
            return reject(null);
          }
          return resolve("edit success");
        }
      );
    });
  }

  delete(id) {
    return new Promise((resolve, reject) => {
      this.mysqlConnect.query(
        `delete from ${this.table} where id=${id}`,
        (err, results) => {
          if (err) {
            return reject(null);
          }
          return resolve("delete success");
        }
      );
    });
  }
  where(condition) {
    console.log(`select * from ${this.table} where ${condition}`);
    return new Promise((resolve, reject) => {
      this.mysqlConnect.query(
        `select * from ${this.table} where ${condition}`,
        (err, results) => {
          if (err) {
            return reject(null);
          }
          return resolve(results);
        }
      );
    });
  }
}

module.exports = Model;
