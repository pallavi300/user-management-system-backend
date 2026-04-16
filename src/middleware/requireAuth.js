const { verifyAccessToken } = require("../auth/jwt");
const { env } = require("../config/env");
const { httpError } = require("../utils/httpError");
const { User } = require("../models/User");

async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[env.COOKIE_NAME];
    if (!token) return next(httpError(401, "Unauthorized"));

    let payload;
    try {
      payload = verifyAccessToken(token, { secret: env.JWT_SECRET });
    } catch {
      return next(httpError(401, "Unauthorized"));
    }

    const user = await User.findById(payload.sub);
    if (!user) return next(httpError(401, "Unauthorized"));
    if (user.status !== "active") return next(httpError(403, "Inactive user"));

    req.user = {
      id: user._id.toString(),
      role: user.role,
    };
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireAuth };

