import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export { pool };

export async function dbHealth() {
  try {
    const r = await pool.query("SELECT 1");
    return r.rowCount === 1;
  } catch (e) {
    console.error("❌ DB Health failed:", e);
    return false;
  }
}

