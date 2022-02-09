import { Request, Response, Router } from "express";
import Post from "./post.interface";

class PostController {
  public path = "/posts";
  public router = Router();

  private posts: Post[] = [
    {
      author: "Marcin",
      content: "Dolor sit amet",
      title: "Lorem Ipsum",
    },
  ];

  constructor() {
    this.initRoutes();
  }

  public initRoutes() {
    this.router.get(this.path, this.getAllPosts);
    this.router.post(this.path, this.createPost);
  }

  getAllPosts(req: Request, res: Response) {
    res.send(this.posts);
  }

  createPost(req: Request, res: Response) {
    const post: Post = req.body;
    this.posts.push(post);
    res.send(post);
  }
}

export default PostController;
