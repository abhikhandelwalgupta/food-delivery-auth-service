/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import { AuthController } from "../controllter/AuthController";
import { UserService } from "../services/UserService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import logger from "../config/logger";

const router = express.Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository, logger);

const authControlloer = new AuthController(userService, logger);

router.post("/register", (req, res, next) => authControlloer.register(req, res, next));

export default router;
