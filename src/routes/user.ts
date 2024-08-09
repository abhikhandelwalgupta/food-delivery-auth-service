/* eslint-disable @typescript-eslint/no-floating-promises */
import express, {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";

import { UserController } from "../controllter/UserController";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../constants";
import { UserService } from "../services/UserService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import logger from "../config/logger";
import listUsersValidator from "../validators/list-users-validator";
import updateUserValidator from "../validators/update-user-validator";
import { UpdateUserRequest } from "../types";

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository, logger);
const userController = new UserController(userService, logger);

const router = express.Router();

router.post(
  "/",
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN, Roles.MANAGER]),
  (req, res, next) => {
    userController.create(req, res, next);
  },
);
router.patch(
  "/:id",
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  updateUserValidator,
  (req: UpdateUserRequest, res: Response, next: NextFunction) =>
    userController.update(req, res, next) as unknown as RequestHandler,
);

router.get(
  "/",
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  listUsersValidator,
  (req: Request, res: Response, next: NextFunction) =>
    userController.getAll(req, res, next) as unknown as RequestHandler,
);

router.get(
  "/:id",
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  (req, res, next) =>
    userController.getOne(req, res, next) as unknown as RequestHandler,
);

router.delete(
  "/:id",
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  (req, res, next) =>
    userController.destroy(req, res, next) as unknown as RequestHandler,
);

export default router;
