/* eslint-disable @typescript-eslint/no-floating-promises */
import express, { RequestHandler } from "express"

import { UserController } from "../controllter/UserController";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../constants";
import { UserService } from "../services/UserService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import logger from "../config/logger";


const userRepository = AppDataSource.getRepository(User)
const userService = new UserService(userRepository,logger);
const userController = new UserController(userService)



const router = express.Router();






router.post("/", authenticate as RequestHandler, canAccess([Roles.ADMIN, Roles.MANAGER]), (req, res, next) => {
    userController.create(req, res, next)
});


export default router;