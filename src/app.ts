import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import express, { Application, urlencoded } from "express";
import Controller from "./interfaces/controller.interface";
import loggerMiddleware from "./middleware/logger.middleware";

class App {
  public app: Application;
  public port: number;

  constructor(controllers: Controller[], port: number) {
    this.app = express();
    this.port = port;
    dotenv.config();

    this.connectToDatabase();
    this.initMiddlewares();
    this.initControllers(controllers);
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`Server Running on ${this.port}`);
    });
  }

  public getServer() {
    return this.app;
  }

  private initMiddlewares() {
    this.app.use(bodyParser.json());
    this.app.use(urlencoded({ extended: false }));
    this.app.use(loggerMiddleware);
  }

  private initControllers(controllers: Controller[]) {
    controllers.forEach((controller) => {
      this.app.use("/", controller.router);
    });
  }

  private async connectToDatabase() {
    const { MONGO_HOST } = process.env;
    try {
      await mongoose.connect(`mongodb://${MONGO_HOST}`);
    } catch (e) {
      console.log(e);
    }
  }
}

export default App;
