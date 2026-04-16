const express = require("express");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const { requireAuth } = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/requireRole");
const { User, ROLES, STATUSES } = require("../models/User");
const { httpError } = require("../utils/httpError");
const { parse, z, emailSchema, passwordSchema } = require("../utils/validators");

const usersRouter = express.Router();

usersRouter.use(requireAuth);

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  q: z.string().trim().optional(),
  role: z.enum(ROLES).optional(),
  status: z.enum(STATUSES).optional(),
});

usersRouter.get("/", requireRole(["admin", "manager"]), async (req, res, next) => {
  try {
    const { page, limit, q, role, status } = parse(listQuerySchema, req.query);
    const filter = {};

    if (role) filter.role = role;
    if (status) filter.status = status;
    if (q) {
      const s = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { name: { $regex: s, $options: "i" } },
        { email: { $regex: s, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({
      items: items.map((u) => u.toSafeJSON()),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
});

usersRouter.get(
  "/:id",
  requireRole(["admin", "manager"]),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!mongoose.isValidObjectId(id)) return next(httpError(400, "Invalid id"));
      const user = await User.findById(id);
      if (!user) return next(httpError(404, "User not found"));
      res.json({ user: user.toSafeJSON() });
    } catch (err) {
      next(err);
    }
  },
);

const createSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: emailSchema,
  password: passwordSchema.optional(),
  role: z.enum(ROLES).default("user"),
  status: z.enum(STATUSES).default("active"),
});

usersRouter.post("/", requireRole("admin"), async (req, res, next) => {
  try {
    const { name, email, password, role, status } = parse(createSchema, req.body);
    const plainPassword = password || Math.random().toString(36).slice(2, 10) + "A1";
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      status,
      createdBy: req.user.id,
      updatedBy: req.user.id,
    });

    res.status(201).json({
      user: user.toSafeJSON(),
      ...(password ? {} : { generatedPassword: plainPassword }),
    });
  } catch (err) {
    if (err?.code === 11000) return next(httpError(409, "Email already exists"));
    next(err);
  }
});

const updateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  email: emailSchema.optional(),
  role: z.enum(ROLES).optional(),
  status: z.enum(STATUSES).optional(),
});

usersRouter.patch(
  "/:id",
  requireRole(["admin", "manager"]),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!mongoose.isValidObjectId(id)) return next(httpError(400, "Invalid id"));

      const target = await User.findById(id);
      if (!target) return next(httpError(404, "User not found"));

      const update = parse(updateSchema, req.body);

      if (req.user.role === "manager") {
        if (target.role === "admin") return next(httpError(403, "Forbidden"));
        if (update.role !== undefined) return next(httpError(403, "Managers cannot change roles"));
        if (update.email !== undefined) return next(httpError(403, "Managers cannot change email"));
      }

      if (req.user.role !== "admin") {
        // manager path already constrained above
      }

      if (update.role && target.role === "admin" && update.role !== "admin") {
        // only admin can change admin role, but keep explicit guard anyway
        if (req.user.role !== "admin") return next(httpError(403, "Forbidden"));
      }

      Object.assign(target, update, { updatedBy: req.user.id });
      await target.save();

      res.json({ user: target.toSafeJSON() });
    } catch (err) {
      if (err?.code === 11000) return next(httpError(409, "Email already exists"));
      next(err);
    }
  },
);

const statusSchema = z.object({
  status: z.enum(STATUSES),
});

usersRouter.patch("/:id/status", requireRole("admin"), async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return next(httpError(400, "Invalid id"));

    const target = await User.findById(id);
    if (!target) return next(httpError(404, "User not found"));

    const { status } = parse(statusSchema, req.body);
    target.status = status;
    target.updatedBy = req.user.id;
    await target.save();

    res.json({ user: target.toSafeJSON() });
  } catch (err) {
    next(err);
  }
});

usersRouter.delete("/:id", requireRole("admin"), async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return next(httpError(400, "Invalid id"));

    if (String(id) === String(req.user.id)) {
      return next(httpError(400, "You cannot delete your own account"));
    }

    const target = await User.findById(id);
    if (!target) return next(httpError(404, "User not found"));

    if (target.role === "admin" && target.status === "active") {
      const remainingActiveAdmins = await User.countDocuments({
        _id: { $ne: target._id },
        role: "admin",
        status: "active",
      });
      if (remainingActiveAdmins === 0) {
        return next(httpError(400, "Cannot delete the last active admin"));
      }
    }

    await User.deleteOne({ _id: target._id });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = { usersRouter };

