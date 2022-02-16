import { NextFunction, Request, Response, Router } from "express";
import HttpException from "../exceptions/http-exception";
import { RequestWithUser } from "../interfaces/request-with-user.interface";
import authMiddleware from "../middleware/auth.middleware";
import validationMiddleware from "../middleware/validation.middleware";
import CreatePostDto from "./post.dto";
import Post from "./post.interface";
import postModel from "./post.model";

class PostController {
  public path = "/posts";
  public router = Router();
  private posts = postModel;

  constructor() {
    this.initRoutes();
  }

  public initRoutes() {
    this.router.get(this.path, this.getAllPosts);
    this.router.get(`${this.path}/:id`, this.getPostById);
    this.router.post(
      this.path,
      validationMiddleware(CreatePostDto),
      this.createPost
    );
    this.router.patch(
      `${this.path}/:id`,
      validationMiddleware(CreatePostDto, true),
      this.updatePost
    );
    this.router.delete(`${this.path}/:id`, this.deletePost);
  }

  async getAllPosts(req: Request, res: Response) {
    const posts: Post[] = await this.posts.find().exec();
    return res.send(posts);
  }

  async getPostById(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id;
    try {
      const post = await this.posts.findById(id);
      return res.send(post);
    } catch (e) {
      next(new HttpException(404, "Post not found"));
    }
  }

  async createPost(req: Request, res: Response) {
    const postData: Post = req.body;
    const createdPost = new this.posts(postData);
    const savedPost = await createdPost.save();

    return res.send(savedPost);
  }

  async updatePost(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id;
    const postData: Post = req.body;
    try {
      const post = await this.posts.findByIdAndUpdate(id, postData);
      return res.send(post);
    } catch (e) {
      console.log(e);
      next(new HttpException(404, "Post not found"));
    }
  }

  async deletePost(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id;
    try {
      await this.posts.findByIdAndDelete(id);
      return res.send(200);
    } catch (e) {
      console.log(e);
      next(new HttpException(404, "Post not found"));
    }
  }
}

export default PostController;
