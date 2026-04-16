const jwt = require("jsonwebtoken");

function signAccessToken({ userId, role }, { secret, expiresIn }) {
  return jwt.sign({ sub: userId, role }, secret, { expiresIn });
}

function verifyAccessToken(token, { secret }) {
  return jwt.verify(token, secret);
}

module.exports = { signAccessToken, verifyAccessToken };

