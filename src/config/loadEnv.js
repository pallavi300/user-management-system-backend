const path = require("path");
const dotenv = require("dotenv");

function loadEnv() {
  const result = dotenv.config({
    path: process.env.DOTENV_PATH
      ? process.env.DOTENV_PATH
      : path.resolve(process.cwd(), ".env"),
  });
  // #region agent log
  fetch('http://127.0.0.1:7448/ingest/4a79958c-8558-43c1-9527-8f27329a7555',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'4c6b0f'},body:JSON.stringify({sessionId:'4c6b0f',runId:'pre-fix',hypothesisId:'H1',location:'backend/src/config/loadEnv.js:12',message:'dotenv_load_result',data:{hasError:Boolean(result?.error),parsedKeys:Object.keys(result?.parsed||{}),hasJwtSecret:Boolean((result?.parsed||{}).JWT_SECRET)},timestamp:Date.now()})}).catch(()=>{});
  // #endregion agent log
}

module.exports = { loadEnv };

