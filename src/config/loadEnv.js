const path = require("path");
const dotenv = require("dotenv");

function loadEnv() {
  const result = dotenv.config({
    path: process.env.DOTENV_PATH
      ? process.env.DOTENV_PATH
      : path.resolve(process.cwd(), ".env"),
  });
  void result;
}

module.exports = { loadEnv };

