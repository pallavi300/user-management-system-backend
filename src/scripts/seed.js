const bcrypt = require("bcryptjs");

const { loadEnv } = require("../config/loadEnv");
const { connectDb } = require("../config/db");

async function seed() {
  loadEnv();
  const { env } = require("../config/env");
  const { User } = require("../models/User");

  await connectDb(env.MONGODB_URI);

  const demo = [
    { name: "Admin", email: "admin@example.com", role: "admin" },
    { name: "Manager", email: "manager@example.com", role: "manager" },
    { name: "User", email: "user@example.com", role: "user" },
  ];

  const password = "Password@123";
  const passwordHash = await bcrypt.hash(password, 10);

  for (const u of demo) {
    await User.updateOne(
      { email: u.email },
      {
        $set: {
          name: u.name,
          role: u.role,
          status: "active",
          passwordHash,
        },
        $setOnInsert: {
          createdBy: null,
        },
      },
      { upsert: true },
    );
  }

  // eslint-disable-next-line no-console
  console.log("Seeded demo users:");
  for (const u of demo) {
    // eslint-disable-next-line no-console
    console.log(`- ${u.role}: ${u.email} / ${password}`);
  }
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

