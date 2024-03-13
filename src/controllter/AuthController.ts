import { NextFunction, Response } from "express";
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload, sign } from "jsonwebtoken";
import fs from "fs"
import path from 'path'
import createHttpError from "http-errors";
import { Config } from "../config";

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
      this.logger.info("User has been created ,", { id: user.id });
      let privateKey: Buffer
      try {
        privateKey = fs.readFileSync(path.join(__dirname, '../../certs/private.pem'));
      } catch (err) {
        const error = createHttpError(500, "Error while reading private key");
        next(error)
        return;
      }

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role
      }



      const accessToken = sign(payload, privateKey, {
        algorithm: "RS256",
        expiresIn: "1h",
        issuer: "auth-service"
      }); // TODO: generate token
      const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
        algorithm: "HS256",
        expiresIn: "1y",
        issuer: "auth-service"
      })



      res.cookie('accessToken', accessToken, {
        domain: 'localhost',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60,
        httpOnly: true
      })

      res.cookie('refreshToken', refreshToken, {
        domain: 'localhost',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true
      })



      res.status(201).json();
    } catch (err) {
      next(err);
      return;
    }
  }
}
