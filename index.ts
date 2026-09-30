import express, { Application } from "express";
import winston, { Logger } from "winston";

const app: Application = express();
require("./startup/logging")();
require("./startup/routes")(app);
require("./startup/config")();
require("./startup/prod")(app);

// Only connect to the real DB and listen when run directly, not when imported by tests.
if (require.main === module) {
  require("./startup/db")();

  const PORT: string | number = process.env.PORT || 3001;
  app.listen(
    PORT,
    (): Logger => winston.info(`Server is running on port: ${PORT}`)
  );
}

export = app;
