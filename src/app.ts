import bodyParser from "body-parser";
import express, { Application, urlencoded } from "express";
import Controller from "./interfaces/controller.interface";
import loggerMiddleware from "./middleware/logger.middleware";

class App {
  public app: Application;
  public port: number;

  constructor(controllers: Controller[], port: number) {
    this.app = express();
    this.port = port;

    this.initMiddlewares();
    this.initControllers(controllers);
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log("Server Running");
    });
  }

  public getServer() {
    return this.app;
  }

  private initMiddlewares() {
    this.app.use(loggerMiddleware);
    this.app.use(bodyParser.json());
    this.app.use(urlencoded({ extended: false }));
  }

  private initControllers(controllers: Controller[]) {
    controllers.forEach((controller) => {
      this.app.use("/", controller.router);
    });
  }
}

export default App;
