import winston from "winston";
import { Config } from ".";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  defaultMeta: { serviceName: "auth-service" },
  transports: [
    new winston.transports.File({
      dirname: "logs",
      filename: "app.log",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      level: "info",
    }),
    new winston.transports.File({
      dirname: "logs",
      filename: "error.log",
      level: "error",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      silent: Config.NODE_ENV === "test",
    }),
    new winston.transports.Console({
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      silent: Config.NODE_ENV === "test",
    }),
  ],
});

export default logger;
