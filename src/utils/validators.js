const { z } = require("zod");

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Invalid email");

const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters");

function parse(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const details = result.error.issues.map((i) => ({
      path: i.path.join("."),
      message: i.message,
    }));
    const err = new Error("Validation error");
    err.statusCode = 400;
    err.details = details;
    throw err;
  }
  return result.data;
}

module.exports = { z, parse, emailSchema, passwordSchema };

