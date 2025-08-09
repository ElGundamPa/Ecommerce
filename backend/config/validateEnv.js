const Joi = require('joi');

const schema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  PORT: Joi.number().default(5000),
  MONGODB_URI: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().min(32).required(),
  FRONTEND_URL: Joi.string().uri().required(),
  REDIS_URL: Joi.string().uri().optional(),
  CSP_CONNECT_EXTRA: Joi.string().allow('').optional(),
  
  // Configuraciones existentes opcionales
  SESSION_SECRET: Joi.string().min(32).optional(),
  GOOGLE_CLIENT_ID: Joi.string().optional(),
  GOOGLE_CLIENT_SECRET: Joi.string().optional(),
  FACEBOOK_APP_ID: Joi.string().optional(),
  FACEBOOK_APP_SECRET: Joi.string().optional(),
  TWITTER_CONSUMER_KEY: Joi.string().optional(),
  TWITTER_CONSUMER_SECRET: Joi.string().optional(),
  EMAIL_HOST: Joi.string().optional(),
  EMAIL_PORT: Joi.number().optional(),
  EMAIL_USER: Joi.string().email().optional(),
  EMAIL_PASS: Joi.string().optional(),
}).unknown(true);

function validateEnv(env = process.env) {
  const { error, value } = schema.validate(env);
  if (error) {
    throw new Error(`Invalid environment configuration: ${error.message}`);
  }
  return value;
}

module.exports = { validateEnv };
