import dotenv from "dotenv";
import Joi from "joi";

dotenv.config();

const schema = Joi.object({
  NODE_ENV: Joi.string().valid("development", "production", "test").required(),
  PORT: Joi.number().default(3000),
  MONGO_URI: Joi.string().required(),
  COINGECKO_BASE_URL: Joi.string().required(),
  SCHEDULER_INTERVAL_SECONDS: Joi.number().default(30)
}).unknown();

const { error, value } = schema.validate(process.env);

if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

export default value;
