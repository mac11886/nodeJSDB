const { response } = require("express");
const mysql = require("mysql");

const mysqlConnect = mysql.createConnection({
  // connectionLimit: 10,
  password: "",
  user: "root",
  database: "ecom_db",
  host: "localhost",
});

mysqlConnect.connect((err) => {
  if (!err) console.log("DB connection success");
  else console.log("DB connect fail");
});

let testdb = {};
testdb.all = () => {
  return new Promise((resolve, reject) => {
    mysqlConnect.query(`select * from job`, (err, results) => {
      if (err) {
        return reject(err);
      }
      return resolve(results);
    });
  });
};
testdb.one = (id) => {
  return new Promise((resolve, reject) => {
    mysqlConnect.query(
      `select * from data where id = ?`,
      [id],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve(results[0]);
      }
    );
  });
};


testdb.delete = (id) => {
  return new Promise((resolve, reject) => {
    mysqlConnect.query(
      `DELETE from data WHERE id = ?`,
      [id],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve("delete success");
      }
    );
  });
};

testdb.add = (req) => {
  // return "yes";
  return new Promise((resolve, reject) => {
    // const params = req.body;
    mysqlConnect.query(`insert into shopee set ?`, req, (err, results) => {
      if (err) {
        return reject(err);
      }
      return resolve("add success");
    });
  });
  // return req;
};
testdb.addJob = (req) => {
  // return "yes";
  return new Promise((resolve, reject) => {
    // const params = req.body;
    mysqlConnect.query(`insert into job set ?`, req, async (err, results) => {
      if (err) {
        return reject(err);
      }
      let data = await new Promise((resolve, reject) => {
        mysqlConnect.query(
          `SELECT * FROM job ORDER BY ID DESC LIMIT 1`, (err, results) => {
            if (err) {
              return reject(err);
            }
            return resolve(results);
          }
        );
      });
      return resolve(data[0]);
    });
  });
  // return req;
};
testdb.addAmazon = (req) => {
  return new Promise((resolve, reject) => {
    mysqlConnect.query(`insert into amazon set ? `, req, (err, results) => {
      if (err) {
        return reject(err);
      }
      return resolve("add success");
    });
  });
};
testdb.addPantip = (req) => {
  return new Promise((resolve, reject) => {
    mysqlConnect.query(`insert into pantip set ?`, req, (err, results) => {
      if (err) {
        return reject(err);
      }
      return resolve("add success");
    });
  });
};

testdb.update = (req) => {
  return new Promise((resolve, reject) => {
    const params = req.body;
    mysqlConnect.query(
      `update data set ? where id = ? `,
      [params, params.id],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve("update success");
      }
    );
  });
};
testdb.updateJob = (id) => {
  let date = new Date(); // Or the date you'd like converted.
  let isoDateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ');
  return new Promise((resolve, reject) => {
    mysqlConnect.query(`update job set end_time = ?, status='success' where id = ? `,
      [isoDateTime, id],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve({time: isoDateTime, status: "success"});
      }
    );
  });
};

module.exports = testdb;
