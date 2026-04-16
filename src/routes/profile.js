const express = require("express");
const bcrypt = require("bcryptjs");

const { requireAuth } = require("../middleware/requireAuth");
const { User } = require("../models/User");
const { httpError } = require("../utils/httpError");
const { parse, z, passwordSchema } = require("../utils/validators");

const profileRouter = express.Router();
profileRouter.use(requireAuth);

profileRouter.get("/", async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return next(httpError(401, "Unauthorized"));
    res.json({ user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
});

const updateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  password: passwordSchema.optional(),
});

profileRouter.patch("/", async (req, res, next) => {
  try {
    const update = parse(updateSchema, req.body);
    const user = await User.findById(req.user.id);
    if (!user) return next(httpError(401, "Unauthorized"));

    if (update.name !== undefined) user.name = update.name;
    if (update.password !== undefined) {
      user.passwordHash = await bcrypt.hash(update.password, 10);
    }
    user.updatedBy = req.user.id;
    await user.save();

    res.json({ user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
});

module.exports = { profileRouter };

