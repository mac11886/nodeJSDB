const mysql = require("mysql2");
const Sequelize =  require("sequelize");
let mysqlConnect
let sequelize

const createPool = () => {
    mysqlConnect = mysql.createPool({
        // connectionLimit: 500,
        password: process.env.DATABASE_PASSWORD,
        user: process.env.DATABASE_USER,
        database: process.env.DATABASE_NAME,
        host: process.env.DATABASE_HOST,
    });
    mysqlConnect.getConnection((err) => {
        if (!err) console.log("DB connection success");
        else console.log("DB connect fail", err);

    });

    sequelize = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USER, process.env.DATABASE_PASSWORD, {
        host: process.env.DATABASE_HOST,
        dialect: 'mysql'/* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */,
        logging : false
       
      });
}

const getMysqlConnect = () => mysqlConnect

const getSequelize = () =>{
    if (sequelize){
        return sequelize
    }else{
        createPool()
        return sequelize
    }
}

module.exports = {
    createPool,
    getSequelize,
    getMysqlConnect
}
// const { response } = require("express");
// const mysql = require("mysql2");

// const mysqlConnect = mysql.createConnection({
//   // connectionLimit: 10,
//   password: "",
//   user: "root",
//   database: "ecom_db",
//   host: "127.0.0.1",
// });

// mysqlConnect.connect((err) => {
//   if (!err) console.log("DB connection success");
//   else console.log("DB connect fail", err);
// });

// let testdb = {};
// testdb.all = () => {
//   return new Promise((resolve, reject) => {
//     mysqlConnect.query(`select * from job`, (err, results) => {
//       if (err) {
//         return reject(err);
//       }

//       return resolve(results);
//     });
//   });
// };
// testdb.one = (id) => {          
//   return new Promise((resolve, reject) => {
//     mysqlConnect.query(
//       `select * from data where id = ?`,
//       [id],
//       (err, results) => {
//         if (err) {
//           return reject(err);
//         }
//         return resolve(results[0]);
//       }
//     );
//   });
// };
// testdb.delete = (id) => {
//   return new Promise((resolve, reject) => {
//     mysqlConnect.query(
//       `DELETE from data WHERE id = ?`,
//       [id],
//       (err, results) => {
//         if (err) {
//           return reject(err);
//         }
//         return resolve("delete success");
//       }
//     );
//   });
// };

// testdb.add = (req) => {
//   // return "yes";
//   return new Promise((resolve, reject) => {
//     // const params = req.body;
//     mysqlConnect.query(`insert into shopee set ?`, req, (err, results) => {
//       if (err) {
//         return reject(err);
//       }
//       return resolve("add success");
//     });
//   });
//   // return req;
// };
// testdb.addJob = (req) => {
//   // return "yes";
//   return new Promise((resolve, reject) => {
//     // const params = req.body;
//     mysqlConnect.query(`insert into job set ?`, req, async (err, results) => {
//       if (err) {
//         return reject(err);
//       }
//       let data = await new Promise((resolve, reject) => {
//         mysqlConnect.query(
//           `SELECT * FROM job ORDER BY ID DESC LIMIT 1`, (err, results) => {
//             if (err) {
//               return reject(err);
//             }
//             return resolve(results);
//           }
//         );
//       });
//       return resolve(data[0]);
//     });
//   });
//   // return req;
// };
// testdb.addAmazon = (req) => {
//   return new Promise((resolve, reject) => {
//     mysqlConnect.query(`insert into amazon set ? `, req, (err, results) => {
//       if (err) {
//         return reject(err);
//       }
//       return resolve("add success");
//     });
//   });
// };
// testdb.addPantip = (req) => {
//   return new Promise((resolve, reject) => {
//     mysqlConnect.query(`insert into pantip set ?`, req, (err, results) => {
//       if (err) {
//         return reject(err);
//       }
//       return resolve("add success");
//     });
//   });
// };

// testdb.update = (req) => {
//   return new Promise((resolve, reject) => {
//     const params = req.body;
//     mysqlConnect.query(
//       `update data set ? where id = ? `,
//       [params, params.id],
//       (err, results) => {
//         if (err) {
//           return reject(err);
//         }
//         return resolve("update success");
//       }
//     );
//   });
// };
// testdb.updateJob = (id) => {
//   let date = new Date(); // Or the date you'd like converted.
//   let isoDateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ');
//   return new Promise((resolve, reject) => {
//     mysqlConnect.query(`update job set end_time = ?, status='success' where id = ? `,
//       [isoDateTime, id],
//       (err, results) => {
//         if (err) {
//           return reject(err);
//         }
//         return resolve({time: isoDateTime, status: "success"});
//       }
//     );
//   });
// };

// module.exports = testdb;
