import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure env is loaded (in case this module is imported before index.ts loads dotenv)
dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true });

// Build connection from individual env vars
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'coreinventory',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

pool.on('connect', () => {
  console.log('📦 Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected PostgreSQL error:', err);
});

// Initialize database schema
export async function initializeDatabase() {
  const schemaPath = path.join(__dirname, '../models/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  try {
    await pool.query(schema);
    console.log('✅ Database schema initialized successfully');
  } catch (err) {
    console.error('❌ Error initializing database schema:', err);
    throw err;
  }
}

// Test connection
export async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ PostgreSQL connected at:', result.rows[0].now);
    return true;
  } catch (err) {
    console.error('❌ PostgreSQL connection failed:', err);
    return false;
  }
}

export default pool;
