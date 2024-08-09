/* eslint-disable no-console */
import { NextFunction, Response } from "express";
import { AuthRequest, RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
import { TokenService } from "../services/TokenService";
import createHttpError from "http-errors";
import { CredentialService } from "../services/CredentialService";
import { Roles } from "../constants";

export class AuthController {
  userService: UserService;
  constructor(
    userService: UserService,
    private logger: Logger,
    private tokenService: TokenService,
    private credentialService: CredentialService,
  ) {
    this.userService = userService;
  }
  async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(400).json({ error: result.array() });
    }
    const { firstName, lastName, email, password } = req.body;
    this.logger.debug("New request to register a user ,", {
      firstName,
      lastName,
      email,
    });
    try {
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role: Roles.CUSTOMER,
      });
      this.logger.info("User has been created ,", { id: user.id });

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);
      //Persist the refresh token

      const newRefreshToken = await this.tokenService.persistRefreshToken(user);
      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
      });

      res.cookie("accessToken", accessToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60,
        httpOnly: true,
      });

      res.cookie("refreshToken", refreshToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
      });

      res.status(201).json(user);
    } catch (err) {
      console.log("Error :- ", err);

      next(err);
      return;
    }
  }

  async self(req: AuthRequest, res: Response) {
    const user = await this.userService.findById(Number(req.auth.sub));
    return res.json({ ...user, password: undefined });
  }

  async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(400).json({ error: result.array() });
    }
    const { email, password } = req.body;

    this.logger.debug("New request to login a user ", {
      email,
      password: "*****",
    });
    try {
      const user = await this.userService.findByEmailWithPassword(email);

      if (!user) {
        const error = createHttpError(400, "Email or password does not match");
        next(error);
        return;
      }

      const isPasswordMatch = await this.credentialService.comparePassowrd(
        password,
        user.password,
      );

      if (!isPasswordMatch) {
        const error = createHttpError(400, "Email or password does not match");
        next(error);
        return;
      }

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);
      //Persist the refresh token

      const newRefreshToken = await this.tokenService.persistRefreshToken(user);
      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
      });

      res.cookie("accessToken", accessToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60,
        httpOnly: true,
      });

      res.cookie("refreshToken", refreshToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
      });

      res.status(200).json(user);
    } catch (err) {
      next(err);
      return;
    }
  }

  async refresh(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const payload: JwtPayload = {
        sub: req.auth.sub,
        role: req.auth.role,
      };

      const user = await this.userService.findById(Number(req.auth.sub));

      if (!user) {
        const error = createHttpError(401, "Invalid token");
        next(error);
        return;
      }

      const accessToken = this.tokenService.generateAccessToken(payload);
      const newRefreshToken = await this.tokenService.persistRefreshToken(user);

      // Delete old Refresh token
      await this.tokenService.deleteRefreshToken(Number(req.auth.id));

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
      });
      res.cookie("accessToken", accessToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60,
        httpOnly: true,
      });

      res.cookie("refreshToken", refreshToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
      });

      this.logger.info("User had been logged in", { id: user.id });
      res.json({ id: user.id });
    } catch (err) {
      next(err);
      return;
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await this.tokenService.deleteRefreshToken(Number(req.auth?.id));
      this.logger.info("User has been logged out", { id: req.auth.sub });
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      res.json({});
    } catch (err) {
      next(err);
      return;
    }
  }
}
