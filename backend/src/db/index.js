const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    })
  : null;

async function query(text, params) {
  if (!pool) {
    throw new Error('DATABASE_URL manquante');
  }

  return pool.query(text, params);
}

async function checkDatabase() {
  if (!pool) {
    return false;
  }

  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database health check error:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  query,
  checkDatabase,
};