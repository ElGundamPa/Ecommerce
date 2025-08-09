const { StatusCodes, getReasonPhrase } = require('http-status-codes');
const logger = require('../config/logger');

class AppError extends Error {
  constructor(message, statusCode = StatusCodes.INTERNAL_SERVER_ERROR, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

// Not Found handler
const notFound = (req, res, next) => {
  next(new AppError('Ruta no encontrada', StatusCodes.NOT_FOUND, { path: req.originalUrl }));
};

// Central error handler
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const response = {
    success: false,
    message: err.message || getReasonPhrase(statusCode),
  };

  if (err.details) {
    response.errors = err.details;
  }

  if (process.env.NODE_ENV !== 'production' && err.stack) {
    response.stack = err.stack;
  }

  // Log the error
  logger.error(err.stack || err.message, {
    method: req.method,
    url: req.originalUrl,
    statusCode,
    ip: req.ip,
  });

  res.status(statusCode).json(response);
};

module.exports = { AppError, notFound, errorHandler };

