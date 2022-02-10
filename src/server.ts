import App from "./app";
import PostController from "./post/post.controller";
import dotenv from "dotenv";

dotenv.config();

const app = new App([new PostController()], Number(process.env.PORT));

app.listen();
