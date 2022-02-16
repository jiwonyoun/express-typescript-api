import { NextFunction, Request, Response, Router } from "express";
import HttpException from "../exceptions/http-exception";
import Controller from "../interfaces/controller.interface";
import postModel from "../post/post.model";
import userModel from "./user.model";

class UserController implements Controller {
  public path = "/users";
  public router = Router();
  private posts = postModel;
  private users = userModel;

  constructor() {
    this.initRoutes();
  }

  private initRoutes() {
    this.router.get(`${this.path}/:id`, this.getUserById);
    this.router.get(`${this.path}/:id/posts`, this.getAllPostsOfUser);
  }

  private getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const id = req.params.id;
    const userQuery = this.users.findById(id);

    if (req.query.withPosts === "true") {
      userQuery.populate("posts").exec();
    }

    const user = await userQuery;
    if (user) {
      res.send(user);
    } else {
      next(new HttpException(404, "User not found"));
    }
  };

  private getAllPostsOfUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const userId = req.params.id;
    // if(userId === req.user.id.toString()) {
    try {
      const posts = await this.posts.find({ author: userId });
      res.send(posts);
    } catch (e) {
      next(new HttpException(404, "Post not found"));
    }
    // }
  };
}

export default UserController;
