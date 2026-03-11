import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL absente — migrations ignorées.');
    return;
  }

  const migrationPath = path.join(__dirname, 'migrations', '001_initial.sql');
  const sql = await fs.readFile(migrationPath, 'utf8');

  try {
    await query(sql);
    console.log('Migrations PostgreSQL appliquées.');
  } catch (error) {
    console.error('Erreur migration PostgreSQL:', error.message);
    throw error;
  }
}

if (process.argv[1] === __filename) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}