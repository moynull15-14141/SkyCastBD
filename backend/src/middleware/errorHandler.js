import { env } from '../config/env.js';

export const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    error: {
      message: statusCode === 500 && env.isProduction ? 'Internal server error.' : error.message,
      details: error.details,
      stack: env.isProduction ? undefined : error.stack
    }
  });
};
