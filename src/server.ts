import App from "./app";
import PostController from "./post/post.controller";
import dotenv from "dotenv";
import { validateEnv } from "./utils/validateEnv";

dotenv.config();
validateEnv();

const app = new App([new PostController()], Number(process.env.PORT));

app.listen();
