/**
 * Generic request validation middleware factory.
 * Validates req.body, req.params, or req.query against a Joi schema.
 */
export const validateRequest = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        error: 'Validation failed.',
        details: error.details.map((d) => ({
          field: d.path.join('.'),
          message: d.message.replace(/"/g, ''),
        })),
      });
    }

    // Replace with validated & sanitized values
    req[property] = value;
    next();
  };
};
