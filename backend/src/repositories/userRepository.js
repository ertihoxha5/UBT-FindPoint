import db from "../config/db.js";

export const findUserByEmail = async (email) => {
  const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  return rows[0];
};

export const createUser = async (fullName,email, password) => {
  const [result] = await db.query(
    "INSERT INTO users (fullName, email, passwordHash) VALUES (?, ?, ?)",
    [fullName, email, password]
  );
  return result.insertId;
};