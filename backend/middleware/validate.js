const Joi = require('joi');
const { AppError } = require('./error');
const { StatusCodes } = require('http-status-codes');

const validate = (schemas = {}) => {
  return (req, res, next) => {
    const sources = ['body', 'params', 'query'];
    const errors = [];

    sources.forEach((source) => {
      if (schemas[source]) {
        const { error, value } = schemas[source].prefs({ abortEarly: false, stripUnknown: true }).validate(req[source]);
        if (error) {
          errors.push(
            ...error.details.map((d) => ({
              field: d.path.join('.'),
              message: d.message,
              source,
            }))
          );
        } else {
          req[source] = value;
        }
      }
    });

    if (errors.length) {
      return next(new AppError('Datos de entrada inválidos', StatusCodes.BAD_REQUEST, errors));
    }

    next();
  };
};

// Versión simple para validar una sola propiedad (útil para casos simples)
const validateSingle = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], { 
      abortEarly: false, 
      stripUnknown: true 
    });
    
    if (error) {
      return next(new AppError('Datos de entrada inválidos', StatusCodes.BAD_REQUEST, 
        error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      ));
    }
    
    req[property] = value;
    next();
  };
};

module.exports = { validate, validateSingle, Joi };

