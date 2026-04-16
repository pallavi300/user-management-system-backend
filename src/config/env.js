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

// #region agent log
fetch('http://127.0.0.1:7448/ingest/4a79958c-8558-43c1-9527-8f27329a7555',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'4c6b0f'},body:JSON.stringify({sessionId:'4c6b0f',runId:'pre-fix',hypothesisId:'H2',location:'backend/src/config/env.js:22',message:'env_built',data:{nodeEnv:env.NODE_ENV,port:env.PORT,clientOrigin:env.CLIENT_ORIGIN,mongoUriPrefix:String(env.MONGODB_URI||'').slice(0,24),hasJwtSecret:Boolean(env.JWT_SECRET),cookieName:env.COOKIE_NAME,cookieSecure:Boolean(env.COOKIE_SECURE)},timestamp:Date.now()})}).catch(()=>{});
// #endregion agent log

module.exports = { env };

