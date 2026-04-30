import db from "../config/db.js";

const hasTable = async (tableName) => {
  const [rows] = await db.query(
    `SELECT 1
     FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
     LIMIT 1`,
    [tableName]
  );

  return rows.length > 0;
};

export const findUserByEmail = async (email) => {
  const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  return rows[0];
};

export const findUserById = async (userId) => {
  const profileTableExists = await hasTable("user_profiles");

  const [rows] = await db.query(
    profileTableExists
      ? `SELECT
          u.userId,
          u.fullName,
          u.email,
          u.role,
          u.faculty,
          u.phoneNumber,
          u.profilePictureUrl,
          u.createdAt,
          u.lastLogin,
          u.isActive,
          p.bio,
          p.avatar_url,
          p.faculty AS profileFaculty,
          p.phone_number AS profilePhoneNumber,
          p.updated_at AS profileUpdatedAt
        FROM users u
        LEFT JOIN user_profiles p ON p.user_id = u.userId
        WHERE u.userId = ?`
      : `SELECT
          u.userId,
          u.fullName,
          u.email,
          u.role,
          u.faculty,
          u.phoneNumber,
          u.profilePictureUrl,
          u.createdAt,
          u.lastLogin,
          u.isActive,
          NULL AS bio,
          NULL AS avatar_url,
          NULL AS profileFaculty,
          NULL AS profilePhoneNumber,
          NULL AS profileUpdatedAt
        FROM users u
        WHERE u.userId = ?`,
    [userId]
  );

  return rows[0];
};

export const createUser = async (fullName, email, password) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      "INSERT INTO users (fullName, email, passwordHash) VALUES (?, ?, ?)",
      [fullName, email, password]
    );

    if (await hasTable("user_profiles")) {
      await connection.query("INSERT INTO user_profiles (user_id) VALUES (?)", [result.insertId]);
    }

    await connection.commit();
    return result.insertId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const updateUserLastLogin = async (userId) => {
  await db.query("UPDATE users SET lastLogin = CURRENT_TIMESTAMP WHERE userId = ?", [userId]);
};

export const updateUserProfile = async (userId, payload) => {
  const profileTableExists = await hasTable("user_profiles");
  const {
    fullName,
    faculty,
    phoneNumber,
    bio,
    profilePictureUrl,
  } = payload;

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE users
       SET
         fullName = ?,
         faculty = ?,
         phoneNumber = ?,
         profilePictureUrl = ?
       WHERE userId = ?`,
      [fullName, faculty || null, phoneNumber || null, profilePictureUrl || null, userId]
    );

    if (profileTableExists) {
      await connection.query(
        `INSERT INTO user_profiles (user_id, bio, avatar_url, faculty, phone_number)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           bio = VALUES(bio),
           avatar_url = VALUES(avatar_url),
           faculty = VALUES(faculty),
           phone_number = VALUES(phone_number)`,
        [userId, bio || null, profilePictureUrl || null, faculty || null, phoneNumber || null]
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const deleteUserAccount = async (userId) => {
  const profileTableExists = await hasTable("user_profiles");
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();
    await connection.query("DELETE FROM media WHERE item_id IN (SELECT item_id FROM items WHERE user_id = ?)", [userId]);
    await connection.query("DELETE FROM items WHERE user_id = ?", [userId]);
    if (profileTableExists) {
      await connection.query("DELETE FROM user_profiles WHERE user_id = ?", [userId]);
    }
    await connection.query("DELETE FROM users WHERE userId = ?", [userId]);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
