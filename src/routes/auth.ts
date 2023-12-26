/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import { AuthController } from "../controllter/AuthController";
import { UserService } from "../services/UserService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";

const router = express.Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const authControlloer = new AuthController(userService);

router.post("/register", (req, res) => authControlloer.register(req, res));

export default router;
