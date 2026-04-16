const express = require("express");
const bcrypt = require("bcryptjs");

const { env } = require("../config/env");
const { User } = require("../models/User");
const { httpError } = require("../utils/httpError");
const { parse, z, emailSchema, passwordSchema } = require("../utils/validators");
const { signAccessToken } = require("../auth/jwt");
const { buildAuthCookieOptions } = require("../auth/cookies");
const { requireAuth } = require("../middleware/requireAuth");

const authRouter = express.Router();

const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = parse(loginSchema, req.body);

    const user = await User.findOne({ email });
    if (!user) return next(httpError(401, "Invalid credentials"));
    if (user.status !== "active") return next(httpError(403, "Inactive user"));

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return next(httpError(401, "Invalid credentials"));

    const token = signAccessToken(
      { userId: user._id.toString(), role: user.role },
      { secret: env.JWT_SECRET, expiresIn: "7d" },
    );

    res.cookie(env.COOKIE_NAME, token, buildAuthCookieOptions({ secure: env.COOKIE_SECURE }));
    res.json({ user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/logout", (req, res) => {
  res.clearCookie(env.COOKIE_NAME, buildAuthCookieOptions({ secure: env.COOKIE_SECURE }));
  res.json({ ok: true });
});

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return next(httpError(401, "Unauthorized"));
    res.json({ user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
});

module.exports = { authRouter };

