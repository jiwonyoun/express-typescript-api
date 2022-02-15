import { cleanEnv, port, str } from "envalid";
import "dotenv/config";

export const validateEnv = () => {
  cleanEnv(process.env, {
    MONGO_HOST: str(),
    PORT: port(),
  });
};
