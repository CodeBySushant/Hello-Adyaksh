// Load .env / .env.local if present (optional dependency).
try {
  require("dotenv").config({ path: ".env.local" });
  require("dotenv").config();
} catch {
  // dotenv not installed — rely on real environment variables instead.
}

const bcrypt = require("bcryptjs");
const mysql = require("mysql2/promise");

async function createAdmin() {
  const username = process.argv[2] || process.env.ADMIN_USERNAME;
  const password = process.argv[3] || process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    console.error(
      "Missing credentials.\n" +
        "Usage: node scripts/createAdmin.js <username> <password>\n" +
        "   or set ADMIN_USERNAME and ADMIN_PASSWORD in your environment.",
    );
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("❌ Refusing to set a password shorter than 8 characters.");
    process.exit(1);
  }

  const db = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "hellomayor",
  });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Upsert: create the admin, or reset the password if the username exists.
    await db.query(
      `INSERT INTO admins (username, password)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE password = VALUES(password)`,
      [username, hashedPassword],
    );

    console.log(`✅ Admin "${username}" created or updated successfully.`);
  } catch (err) {
    console.error("❌ Failed to create admin:", err.message);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

createAdmin();