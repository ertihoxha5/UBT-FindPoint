import db from "../config/db.js";

export const findUserByEmail = async (email) => {
  const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  return rows[0];
};

export const findUserById = async (userId) => {
  const [rows] = await db.query("SELECT * FROM users WHERE userId = ?", [userId]);
  return rows[0];
};

export const createUser = async (fullName,email, password) => {
  const [result] = await db.query(
    "INSERT INTO users (fullName, email, passwordHash) VALUES (?, ?, ?)",
    [fullName, email, password]
  );
  return result.insertId;
};

export const updateUserPassword = async (userId, passwordHash) => {
  await db.query("UPDATE users SET passwordHash = ? WHERE userId = ?", [passwordHash, userId]);
};

export const createPasswordResetToken = async (userId, tokenHash, expiresAt) => {
  const [result] = await db.query(
    "INSERT INTO password_reset_tokens (userId, tokenHash, expiresAt) VALUES (?, ?, ?)",
    [userId, tokenHash, expiresAt]
  );

  return result.insertId;
};

export const findPasswordResetTokenByHash = async (tokenHash) => {
  const [rows] = await db.query(
    "SELECT * FROM password_reset_tokens WHERE tokenHash = ? LIMIT 1",
    [tokenHash]
  );

  return rows[0];
};

export const markPasswordResetTokenUsed = async (tokenId) => {
  await db.query("UPDATE password_reset_tokens SET usedAt = NOW() WHERE id = ?", [tokenId]);
};