const express = require("express");
const { spawn } = require("child_process");
const app = express();
const port = 3030;
app.get("/", (req, res) => {
  var dataToSend;
  // spawn new child process to call the python script
  const python = spawn("python", [
    "C:/Users/LENOVO/Desktop/python/pythongetpostshopee3/main.py",
  ]);

  python.stdin.write(
    "1\n1\nhttps://shopee.co.th/search?keyword=%E0%B8%A3%E0%B8%96"
  );
  python.stdin.end();

  // collect data from script
  python.stdout.on("data", function (data) {
    console.log("Pipe data from python script ...");
    dataToSend = data.toString();
  });
  // in close event we are sure that stream from child process is closed
  python.on("exit", (code) => {
    console.log(`child process close all stdio with code ${code}`);
    // send data to browser
    res.send("success");
  });
});
app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);
module.exports = app;
