/**
 * Seed script – creates the default roles (admin, seller, user) if they don't exist.
 * Run once with:  node backend/scripts/seedRoles.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const { Role } = require("../models/user");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce";

const DEFAULT_ROLES = ["admin", "seller", "user"];

async function seedRoles() {
  console.log("Connecting to MongoDB:", MONGODB_URI.replace(/:\/\/.*@/, "://***@"));
  await mongoose.connect(MONGODB_URI);
  console.log("Connected.");

  for (const name of DEFAULT_ROLES) {
    const existing = await Role.findOne({ name });
    if (existing) {
      console.log(`  Role "${name}" already exists – skipping.`);
    } else {
      await new Role({ name, users: [] }).save();
      console.log(`  Created role "${name}".`);
    }
  }

  await mongoose.disconnect();
  console.log("Done.");
}

seedRoles().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
