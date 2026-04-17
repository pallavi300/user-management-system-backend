function mustGet(name, value) {
  if (value === undefined || value === null || String(value).trim() === "") {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 5000),
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  MONGODB_URI:
    process.env.MONGODB_URI || "mongodb://localhost:27017/user_management",
  JWT_SECRET: mustGet("JWT_SECRET", process.env.JWT_SECRET),
  COOKIE_NAME: process.env.COOKIE_NAME || "access_token",
  COOKIE_SECURE: process.env.COOKIE_SECURE
    ? process.env.COOKIE_SECURE === "true"
    : false,
};

module.exports = { env };

