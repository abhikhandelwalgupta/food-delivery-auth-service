import "reflect-metadata";
import express, { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";
import logger from "./config/logger";
import authRouter from "./routes/auth";
import cookieParse from "cookie-parser";
import tenantRouter from "./routes/tenant";

const app = express();
app.use(cookieParse());
app.use(express.static("public"));
app.use(express.json());

app.use("/auth", authRouter);
app.use("/tenants", tenantRouter);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message);

  const statusCode = err.statusCode || err.status || 500;

  res.status(statusCode).json({
    errors: [
      {
        type: err.name,
        msg: err.message,
        path: "",
        location: "",
      },
    ],
  });
});

app.get("/", (req, res) => {
  res.send("Hello Welcome to auth service");
});

export default app;
