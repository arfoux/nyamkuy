import { getRequestContext } from "@cloudflare/next-on-pages";

export function getDB() {
  const { env } = getRequestContext();
  if (!env?.DB) throw new Error("❌ D1 binding 'DB' not found");
  return env.DB;
}

export const DB = {
  all: async (query, params = []) => {
    const db = getDB();
    return await db.prepare(query).bind(...params).all();
  },
  first: async (query, params = []) => {
    const db = getDB();
    return await db.prepare(query).bind(...params).first();
  },
  run: async (query, params = []) => {
    const db = getDB();
    return await db.prepare(query).bind(...params).run();
  },
};

// ✅ Tambahkan ini
export const UserQuery = {
  byEmail: (db, email) =>
    db.prepare("SELECT * FROM users WHERE email = ? LIMIT 1")
      .bind(email).first(),

  byId: (db, id) =>
    db.prepare("SELECT * FROM users WHERE id = ? LIMIT 1")
      .bind(id).first(),

  byVerifyToken: (db, token) =>
    db.prepare("SELECT * FROM users WHERE verify_token = ? LIMIT 1")
      .bind(token).first(),

  create: (db, u) =>
    db.prepare(
      `INSERT INTO users (id, email, password_hash, role, email_verified, verify_token, verify_exp, created_at)
       VALUES (?, ?, ?, ?, 0, ?, ?, ?)`
    ).bind(u.id, u.email, u.password_hash, u.role, u.verify_token, u.verify_exp, Date.now()).run(),

  markVerified: (db, id) =>
    db.prepare(
      "UPDATE users SET email_verified = 1, verify_token = NULL, verify_exp = NULL WHERE id = ?"
    ).bind(id).run(),

  updateLastLogin: (db, id) =>
    db.prepare("UPDATE users SET last_login_at = ? WHERE id = ?")
      .bind(Date.now(), id).run(),

  updateDisplayName: (db, id, displayName) =>
    db.prepare("UPDATE users SET display_name = ? WHERE id = ?")
      .bind(displayName, id).run(),
};
