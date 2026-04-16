function errorHandler(err, req, res, next) {
  const status = Number(err.statusCode || err.status || 500);
  const message = status >= 500 ? "Internal server error" : err.message;

  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(status).json({
    message,
    ...(err.details ? { details: err.details } : {}),
  });
}

module.exports = { errorHandler };

