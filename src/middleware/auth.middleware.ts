import { NextFunction, Response } from "express";
import "dotenv/config";
import * as jwt from "jsonwebtoken";
import { DataStoredInToken } from "../interfaces/jwt.interface";
import userModel from "../user/user.model";
import HttpException from "../exceptions/http-exception";
import { RequestWithUser } from "../interfaces/request-with-user.interface";

const authMiddleware = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const cookies = req.cookies;
  if (cookies && cookies.Authorization) {
    const secret = String(process.env.JWT_SECRET);

    try {
      const verificationResponse = jwt.verify(
        cookies.Authorization,
        secret
      ) as DataStoredInToken;
      const id = verificationResponse.id;
      const user = await userModel.findById(id);

      if (user) {
        req.user = user;
        next();
      } else {
        next(new HttpException(402, "Wrong auth token"));
      }
    } catch (e) {
      console.log(e);
      next(new HttpException(402, "Wrong auth token"));
    }
  } else {
    next(new HttpException(404, "Token not found"));
  }
};

export default authMiddleware;
