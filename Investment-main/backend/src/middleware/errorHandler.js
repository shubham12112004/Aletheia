const { ZodError } = require('zod');
const AppError = require('../utils/AppError');
const { failure } = require('../utils/apiResponse');
const logger = require('../utils/logger');

function notFoundHandler(req, _res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    return failure(res, 'Validation failed', 400, err.issues);
  }

  if (err instanceof AppError) {
    return failure(res, err.message, err.statusCode, err.details);
  }

  logger.error(err.message || 'Unhandled error', {
    stack: err.stack,
  });

  return failure(res, 'Internal server error', 500);
}

module.exports = { notFoundHandler, errorHandler };
