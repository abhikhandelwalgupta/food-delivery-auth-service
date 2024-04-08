//import createError from "http-errors";
import app from "./app";
import { Config } from "./config";
import { AppDataSource } from "./config/data-source";
import logger from "./config/logger";

const startServer = async () => {
  const PORT = Config.PORT;
  logger.info("inside server.ts");
  try {
    await AppDataSource.initialize();
    logger.info("Database connection established successfully.");
    app.listen(PORT, () => logger.info(`Listening on port  ${PORT}`));
  } catch (error) {
    // eslint-disable-next-line no-console
    if (error instanceof Error) {
      logger.error(error);
      process.exit(1);
    }
  }
};

void startServer();
