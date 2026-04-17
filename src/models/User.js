const mongoose = require("mongoose");

const ROLES = ["admin", "manager", "user"];
const STATUSES = ["active", "inactive"];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ROLES, default: "user", required: true },
    status: { type: String, enum: STATUSES, default: "active", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    status: this.status,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    createdBy: this.createdBy || null,
    updatedBy: this.updatedBy || null,
  };
};

const User = mongoose.model("User", userSchema);

module.exports = { User, ROLES, STATUSES };

