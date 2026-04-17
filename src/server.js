const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");

const { loadEnv } = require("./config/loadEnv");
const { connectDb } = require("./config/db");
const { notFound } = require("./middleware/notFound");
const { errorHandler } = require("./middleware/errorHandler");

async function main() {
  loadEnv();
  const { env } = require("./config/env");
  const { authRouter } = require("./routes/auth");
  const { usersRouter } = require("./routes/users");
  const { profileRouter } = require("./routes/profile");
  await connectDb(env.MONGODB_URI);

  const app = express();

  app.use(morgan("dev"));
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    }),
  );
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (
      (req.method === "OPTIONS" || req.method === "POST") &&
      req.path === "/api/auth/login"
    ) {
      void origin;
    }
    next();
  });
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  app.get("/api/health", (req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/profile", profileRouter);

  app.use(notFound);
  app.use(errorHandler);

  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

