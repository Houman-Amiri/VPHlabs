const { AppError } = require('./errorHandler');

function formatZodIssues(zodError) {
  return zodError.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
}

function validateBody(schema) {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return next(
        new AppError(
          'اطلاعات ارسالی نامعتبر است.',
          400,
          'VALIDATION_ERROR',
          formatZodIssues(parsed.error)
        )
      );
    }
    req.body = parsed.data;
    return next();
  };
}

function validateQuery(schema) {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      return next(
        new AppError(
          'پارامترهای جستجو نامعتبر است.',
          400,
          'QUERY_VALIDATION_ERROR',
          formatZodIssues(parsed.error)
        )
      );
    }
    req.query = parsed.data;
    return next();
  };
}

function validateParams(schema) {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req.params);
    if (!parsed.success) {
      return next(
        new AppError(
          'پارامتر مسیر نامعتبر است.',
          400,
          'PARAMS_VALIDATION_ERROR',
          formatZodIssues(parsed.error)
        )
      );
    }
    req.params = parsed.data;
    return next();
  };
}

module.exports = {
  validateBody,
  validateQuery,
  validateParams,
};
