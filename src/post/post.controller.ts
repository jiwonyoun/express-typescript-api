import { NextFunction, Request, response, Response, Router } from "express";
import Post from "./post.interface";
import postModel from "./post.model";

class PostController {
  public path = "/posts";
  public router = Router();
  private posts = postModel;

  //   private posts: Post[] = [
  //     {
  //       author: "Marcin",
  //       content: "Dolor sit amet",
  //       title: "Lorem Ipsum",
  //     },
  //   ];

  constructor() {
    this.initRoutes();
  }

  public initRoutes() {
    this.router.get(this.path, this.getAllPosts);
    this.router.get(`${this.path}/:id`, this.getPostById);
    this.router.post(this.path, this.createPost);
    this.router.patch(`${this.path}/:id`, this.updatePost);
    this.router.delete(`${this.path}/:id`, this.deletePost);
  }

  async getAllPosts(req: Request, res: Response) {
    const posts: Post[] = await this.posts.find().exec();
    return res.send(posts);
  }

  async getPostById(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id;
    const post = await this.posts.findById(id);

    if (!post) {
      throw new Error("Post Not Found.");
    }

    return res.send(post);
  }

  async createPost(req: Request, res: Response) {
    const postData: Post = req.body;
    const createdPost = new this.posts(postData);
    const savedPost = await createdPost.save();

    return res.send(savedPost);
  }

  async updatePost(req: Request, res: Response) {
    const id = req.params.id;
    const postData: Post = req.body;
    try {
      await this.posts.findByIdAndUpdate(id, postData);
      return res.status(200);
    } catch (e) {
      console.log(e);
      return res.status(404);
    }
  }

  async deletePost(req: Request, res: Response) {
    const id = req.params.id;
    try {
      await this.posts.findByIdAndDelete(id);
      return res.status(200);
    } catch (e) {
      console.log(e);
      return res.status(404);
    }
  }
}

export default PostController;
