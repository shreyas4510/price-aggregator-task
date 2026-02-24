import dotenv from "dotenv";
import Joi from "joi";

dotenv.config();

const schema = Joi.object({
  NODE_ENV: Joi.string().valid("development", "production", "test").required(),
  RPC_PORT: Joi.number().default(40001),
  MONGO_URI: Joi.string().required(),
  COINGECKO_BASE_URL: Joi.string().required(),
  SCHEDULER_INTERVAL_SECONDS: Joi.number().default(30),
  RPC_BOOTSTRAP_HOST: Joi.string().default("127.0.0.1"),
  RPC_BOOTSTRAP_PORT: Joi.number().default(30001)
}).unknown();

const { error, value } = schema.validate(process.env);

if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

export default value;
