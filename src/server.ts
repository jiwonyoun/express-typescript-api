import App from "./app";
import PostController from "./post/post.controller";
import dotenv from "dotenv";
import { validateEnv } from "./utils/validateEnv";
import AuthController from "./auth/auth.controller";

dotenv.config();
validateEnv();

const app = new App(
  [new PostController(), new AuthController()],
  Number(process.env.PORT)
);

app.listen();
