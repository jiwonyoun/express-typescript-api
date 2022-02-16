import { NextFunction, Request, response, Response, Router } from "express";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import "dotenv/config";
import userModel from "../user/user.model";
import Controller from "../interfaces/controller.interface";
import validationMiddleware from "../middleware/validation.middleware";
import CreateUserDto from "../user/user.dto";
import HttpException from "../exceptions/http-exception";
import LoginDto from "./login.dto";
import User from "../user/user.interface";
import { DataStoredInToken, TokenData } from "../interfaces/jwt.interface";

export const SET_COOKIE = "Set-Cookie";

class AuthController implements Controller {
  public path = "/auth";
  public router = Router();
  private users = userModel;

  constructor() {
    this.initRoutes();
  }

  private initRoutes() {
    this.router.post(
      `${this.path}/register`,
      validationMiddleware(CreateUserDto),
      this.register
    );
    this.router.post(
      `${this.path}/login`,
      validationMiddleware(LoginDto),
      this.login
    );
    this.router.post(`${this.path}/logout`, this.logout);
  }

  private register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const userData: CreateUserDto = req.body;

    if (await this.users.findOne({ email: userData.email })) {
      next(new HttpException(400, "User is already exists."));
    } else {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await this.users.create({
        ...userData,
        password: hashedPassword,
      });

      const tokenData = this.createToken(user);
      res.setHeader(SET_COOKIE, [this.createCookie(tokenData)]);

      res.send(user);
    }
  };

  private login = async (req: Request, res: Response, next: NextFunction) => {
    const loginData: LoginDto = req.body;
    const user = await this.users.findOne({ email: loginData.email });

    if (user) {
      const isPasswordMatching = await bcrypt.compare(
        loginData.password,
        user.password
      );
      if (isPasswordMatching) {
        const tokenData = this.createToken(user);
        res.setHeader(SET_COOKIE, [this.createCookie(tokenData)]);

        res.send(user);
      } else {
        next(new HttpException(401, "Wrong password"));
      }
    } else {
      next(new HttpException(404, "User not found"));
    }
  };

  private logout = async (req: Request, res: Response) => {
    response.setHeader("Set-Cookie", ["Authorization=;Max-age=0"]);
    response.send(200);
  };

  private createToken(user: User): TokenData {
    const expiresIn = 60 * 60; // an hour
    const secret = String(process.env.JWT_SECRET);
    const dataStoredInToken: DataStoredInToken = {
      id: user.id,
    };

    return {
      expiresIn,
      token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
    };
  }

  private createCookie(tokenData: TokenData) {
    return `Authorization=${tokenData.token}; HttpOnly: Max-Age=${tokenData.expiresIn}`;
  }
}

export default AuthController;
