const dotenv = require("dotenv");
const { createPool } = require("./db");
dotenv.config()
createPool()
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cors = require("cors");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const { spawn } = require("child_process");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var dataRouter = require("./routes/data");



var app = express();



const Main = require("./model/Main.model")
const Amazon = require("./model/Amazon.model")
const Pantip = require("./model/Pantip.model")
const Facebook = require("./model/Facebook.model")

const findOne = Facebook.findOne({ where: { id: 1 }, attributes: ['job_id'] }).then(result => {
  // console.log(result.map(r => r.job_id))
  // console.log(result.map(r => r.job_id))
  if (!result) {
    Amazon.create({
      id : 1000,
      name: "test"
    })
  } else {
    console.log(`found`, result.job_id)
  }
})



// view engine setup
// app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
// app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(cors());
// send data to backend
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use('public/javascripts', express.static(path.join(__dirname, 'public/javascripts')));


app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/data", dataRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});



// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});
app.listen(3000, () => {
  console.log(`Server is running on port: ${process.env.PORT || `3000`}`);
  
});


module.exports = app;
