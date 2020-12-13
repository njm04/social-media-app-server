import express from "express";

const app = express();
var test = "hello world";
console.log(test);

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () =>
  console.log(`Server is running on port: ${PORT}`)
);

module.exports = server;
