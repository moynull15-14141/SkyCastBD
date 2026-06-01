export const validate = (schema, source = 'query') => (req, _res, next) => {
  console.log(`🔍 Validation [${source}]:`, JSON.stringify(req[source], null, 2));
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    console.log(`❌ Validation errors:`, result.error.flatten().fieldErrors);
    const error = new Error(`Invalid request ${source}.`);
    error.statusCode = 400;
    error.details = result.error.flatten().fieldErrors;
    return next(error);
  }

  req[source] = result.data;
  return next();
};
