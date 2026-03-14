import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function setup() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        otp_code VARCHAR(10) NOT NULL,
        invalid_attempts INTEGER DEFAULT 0,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id);
    `);
    console.log("Password resets table created successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error creating table:", err);
    process.exit(1);
  }
}

setup();
