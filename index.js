const express = require("express");
const app = express();
const db = require("./startup/db");
const winston = require("winston");

require("./startup/logging")();
require("./startup/routes")(app);

db.authenticate({force:true})
  .then(() => {
    winston.info("Database connected...");
    // db.sync({force : true})
    //   .then(() => {
    //     winston.info("Tables created....");
    //   })
    //   .catch((ex) => {
    //     winston.info("Tables NOT created...", ex);
    //   });
  })
  .catch((ex) => {
    winston.error("Database NOT connected...", ex);
  });

  module.exports = app.listen(1111, () => {
    winston.info("Listening on  http://localhost:1111");
  });