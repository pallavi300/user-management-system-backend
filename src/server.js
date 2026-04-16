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

  // #region agent log
  fetch('http://127.0.0.1:7448/ingest/4a79958c-8558-43c1-9527-8f27329a7555',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'4c6b0f'},body:JSON.stringify({sessionId:'4c6b0f',runId:'pre-fix',hypothesisId:'H3',location:'backend/src/server.js:23',message:'server_env_snapshot',data:{clientOrigin:env.CLIENT_ORIGIN,port:env.PORT,cookieName:env.COOKIE_NAME,cookieSecure:Boolean(env.COOKIE_SECURE)},timestamp:Date.now()})}).catch(()=>{});
  // #endregion agent log

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
      // #region agent log
      fetch('http://127.0.0.1:7448/ingest/4a79958c-8558-43c1-9527-8f27329a7555',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'4c6b0f'},body:JSON.stringify({sessionId:'4c6b0f',runId:'pre-fix',hypothesisId:'H1',location:'backend/src/server.js:41',message:'incoming_login_request',data:{method:req.method,path:req.path,origin:String(origin||''),hasCookieHeader:Boolean(req.headers.cookie),allowedOrigin:env.CLIENT_ORIGIN},timestamp:Date.now()})}).catch(()=>{});
      // #endregion agent log
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

