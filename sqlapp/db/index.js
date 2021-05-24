const mysql = require("mysql");

const mysqlConnect = mysql.createConnection({
  // connectionLimit: 10,
  password: "",
  user: "root",
  database: "python_db",
  host: "localhost",
});

mysqlConnect.connect((err) => {
  if (!err) console.log("DB connection success");
  else console.log("DB connect fail");
});

let testdb = {};
testdb.all = () => {
  return new Promise((resolve, reject) => {
    mysqlConnect.query(`select * from shopee`, (err, results) => {
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

module.exports = testdb;
