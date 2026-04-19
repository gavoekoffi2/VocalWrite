import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath =
  process.env.DATABASE_PATH || path.join(__dirname, "..", "vocrit.db");

export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS checkout_sessions (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      device_id TEXT NOT NULL,
      amount_xof INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'XOF',
      provider TEXT NOT NULL DEFAULT 'money_fusion',
      status TEXT NOT NULL DEFAULT 'pending',
      provider_reference TEXT,
      checkout_url TEXT,
      license_key TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS licenses (
      key TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      device_id TEXT,
      tier TEXT NOT NULL DEFAULT 'premium',
      expires_at TEXT,
      revoked_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_licenses_email ON licenses(email);
    CREATE INDEX IF NOT EXISTS idx_checkout_status ON checkout_sessions(status);
  `);
}
