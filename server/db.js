/**
 * ============================================================================
 * Alumni Tracker — PostgreSQL Database Connection Pool
 * ============================================================================
 * Architectural Layer: DATABASE / PERSISTENCE (DDD Specification)
 * Author: Mehmet Raşid Ünlüel (Istanbul University - YBS)
 * ============================================================================
 */

const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Determine connection URL (supports local dev, Docker network, and cloud)
const connectionString = process.env.DATABASE_URL || 
  'postgresql://postgres:postgres@localhost:5432/alumni_db?schema=public';

const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[PostgreSQL Pool Error]: Unexpected error on idle client', err);
});

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
};
