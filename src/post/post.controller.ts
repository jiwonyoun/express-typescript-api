import { NextFunction, Request, Response, Router } from "express";
import HttpException from "../exceptions/http-exception";
import Controller from "../interfaces/controller.interface";
import { RequestWithUser } from "../interfaces/request-with-user.interface";
import authMiddleware from "../middleware/auth.middleware";
import validationMiddleware from "../middleware/validation.middleware";
import CreatePostDto from "./post.dto";
import Post from "./post.interface";
import postModel from "./post.model";

class PostController implements Controller {
  public path = "/posts";
  public router = Router();
  private posts = postModel;

  constructor() {
    this.initRoutes();
  }

  public initRoutes() {
    this.router.get(this.path, this.getAllPosts);
    this.router.get(`${this.path}/:id`, this.getPostById);
    this.router
      .all(`${this.path}/*`, authMiddleware)
      .post(
        this.path,
        authMiddleware,
        validationMiddleware(CreatePostDto),
        this.createPost
      )
      .patch(
        `${this.path}/:id`,
        validationMiddleware(CreatePostDto, true),
        this.updatePost
      )
      .delete(`${this.path}/:id`, this.deletePost);
  }

  async getAllPosts(req: Request, res: Response) {
    const posts: Post[] = await this.posts
      .find()
      .populate("author", "-password");
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

  async createPost(req: RequestWithUser, res: Response) {
    const postData: CreatePostDto = req.body;
    const createdPost = new this.posts({ ...postData, authorId: req.user?.id });

    const savedPost = await createdPost.save();
    await savedPost.populate("author", "-password");

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
