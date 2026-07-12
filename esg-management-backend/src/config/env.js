import dotenv from 'dotenv';
import Joi from 'joi';

// Load environment variables from .env file
dotenv.config();

// Define schema for environment variables
const envSchema = Joi.object({
  PORT: Joi.number().default(5000),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  MONGODB_URI: Joi.string().required().description('MongoDB connection URI'),
  JWT_SECRET: Joi.string().required().description('JWT Secret Key'),
  JWT_EXPIRES_IN: Joi.string().default('1d'),
  EMAIL_HOST: Joi.string().required().description('SMTP Server Host'),
  EMAIL_PORT: Joi.number().default(587),
  EMAIL_USER: Joi.string().required().description('SMTP Username'),
  EMAIL_PASS: Joi.string().required().description('SMTP Password')
}).unknown().required();

// Validate variables
const { value: envVars, error } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URI,
    options: {}
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_EXPIRES_IN
  },
  email: {
    smtp: {
      host: envVars.EMAIL_HOST,
      port: envVars.EMAIL_PORT,
      auth: {
        user: envVars.EMAIL_USER,
        pass: envVars.EMAIL_PASS
      }
    }
  }
};
