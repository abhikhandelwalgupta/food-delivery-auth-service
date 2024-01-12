/* eslint-disable no-console */
import { NextFunction, Response } from "express";
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
//import createHttpError from "http-errors";

export class AuthController {
  userService: UserService;
  constructor(userService: UserService, private logger: Logger) {
    this.userService = userService;
  }
  async register(req: RegisterUserRequest, res: Response, next: NextFunction) {

    const result = validationResult(req)

    if (!result.isEmpty()) {
      return res.status(400).json({ error: result.array() })
    }
    const { firstName, lastName, email, password } = req.body;


    this.logger.debug("New request to register a user ,", { firstName, lastName, email })
    try {
      const user = await this.userService.create({ firstName, lastName, email, password });
      this.logger.info("User has been created ,", { id: user.id })
      res.status(201).json();
    } catch (err) {
      next(err);
      return;
    }
  }
}
