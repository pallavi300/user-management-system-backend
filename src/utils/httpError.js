function httpError(statusCode, message, details) {
  const err = new Error(message || "Error");
  err.statusCode = statusCode;
  if (details !== undefined) err.details = details;
  return err;
}

module.exports = { httpError };

