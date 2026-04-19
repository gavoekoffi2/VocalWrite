import { nanoid } from "nanoid";
import { db } from "./db.js";

const {
  SUBSCRIPTION_DURATION_DAYS = "365",
  ADMIN_EMAILS = "",
  ADMIN_MASTER_KEY = "",
} = process.env;

const adminEmails = ADMIN_EMAILS.split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function generateKey() {
  return `VOCRIT-${nanoid(6)}-${nanoid(6)}-${nanoid(6)}`.toUpperCase();
}

export function isAdmin(email) {
  return adminEmails.includes((email || "").toLowerCase());
}

export function issueLicense({ email, deviceId, tier }) {
  const normalisedEmail = (email || "").toLowerCase();
  const effectiveTier =
    tier === "admin_free" || isAdmin(normalisedEmail)
      ? "admin_free"
      : "premium";

  const key =
    effectiveTier === "admin_free" && ADMIN_MASTER_KEY
      ? ADMIN_MASTER_KEY
      : generateKey();

  const days = Number.parseInt(SUBSCRIPTION_DURATION_DAYS, 10);
  const expiresAt =
    effectiveTier === "admin_free"
      ? null
      : new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

  db.prepare(
    `INSERT INTO licenses (key, email, device_id, tier, expires_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET
       email = excluded.email,
       device_id = excluded.device_id,
       tier = excluded.tier,
       expires_at = excluded.expires_at,
       revoked_at = NULL`,
  ).run(key, normalisedEmail, deviceId || null, effectiveTier, expiresAt);

  return { key, tier: effectiveTier, expiresAt };
}

export function verifyLicense({ key, email, deviceId }) {
  if (!key) return { valid: false, reason: "missing_key" };

  if (ADMIN_MASTER_KEY && key === ADMIN_MASTER_KEY) {
    return { valid: true, tier: "admin_free", expiresAt: null };
  }

  const row = db
    .prepare("SELECT * FROM licenses WHERE key = ? LIMIT 1")
    .get(key);

  if (!row) return { valid: false, reason: "unknown_key" };
  if (row.revoked_at) return { valid: false, reason: "revoked" };
  if (email && row.email !== email.toLowerCase()) {
    return { valid: false, reason: "email_mismatch" };
  }
  if (row.expires_at && new Date(row.expires_at) < new Date()) {
    return { valid: false, reason: "expired" };
  }
  if (deviceId && row.device_id && row.device_id !== deviceId) {
    return { valid: false, reason: "device_mismatch" };
  }

  if (deviceId && !row.device_id) {
    db.prepare("UPDATE licenses SET device_id = ? WHERE key = ?").run(
      deviceId,
      key,
    );
  }

  return {
    valid: true,
    tier: row.tier,
    expiresAt: row.expires_at,
    email: row.email,
  };
}
