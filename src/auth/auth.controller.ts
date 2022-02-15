import { NextFunction, Request, response, Response, Router } from "express";
import * as bcrypt from "bcrypt";
import userModel from "../user/user.model";
import Controller from "../interfaces/controller.interface";
import validationMiddleware from "../middleware/validation.middleware";
import CreateUserDto from "../user/user.dto";
import HttpException from "../exceptions/http-exception";
import LoginDto from "./login.dto";

class AuthController implements Controller {
  public path = "/auth";
  public router = Router();
  private users = userModel;

  private initRoutes() {
    this.router.post(
      `${this.path}/register`,
      validationMiddleware(CreateUserDto),
      this.register
    );
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
        res.send(user);
      } else {
        next(new HttpException(401, "Wrong password"));
      }
    } else {
      next(new HttpException(404, "User not found"));
    }
  };
}

export default AuthController;
