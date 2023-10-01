import app from "./app";
import { Config } from "./config";
import logger from "./config/logger";

const startServer = () => {
  const PORT = Config.PORT;
  try {
    app.listen(PORT, () => logger.info(`Listening on port  ${PORT}`));
  } catch (error) {
    // eslint-disable-next-line no-console
    if (error instanceof Error) {
      logger.error(error);
      process.exit(1);
    }
  }
};

startServer();
