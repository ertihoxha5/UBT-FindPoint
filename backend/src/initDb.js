import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

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

const hasColumn = async (tableName, columnName) => {
  const [rows] = await db.query(
    `SELECT 1
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND COLUMN_NAME = ?
     LIMIT 1`,
    [tableName, columnName]
  );

  return rows.length > 0;
};

const hasForeignKey = async (tableName, constraintName) => {
  const [rows] = await db.query(
    `SELECT 1
     FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND CONSTRAINT_NAME = ?
       AND CONSTRAINT_TYPE = 'FOREIGN KEY'
     LIMIT 1`,
    [tableName, constraintName]
  );

  return rows.length > 0;
};

export const initDB = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        profile_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        bio TEXT,
        avatar_url VARCHAR(255),
        faculty VARCHAR(100),
        phone_number VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(userId) ON DELETE CASCADE
      )
    `);

    if (await hasTable("items")) {
      if (!(await hasColumn("items", "user_id"))) {
        await db.query("ALTER TABLE items ADD COLUMN user_id INT NULL AFTER item_id");
      }

      if (!(await hasForeignKey("items", "fk_items_user_id"))) {
        await db.query("ALTER TABLE items ADD CONSTRAINT fk_items_user_id FOREIGN KEY (user_id) REFERENCES users(userId)");
      }

      if (!(await hasColumn("items", "moderation_status"))) {
        await db.query("ALTER TABLE items ADD COLUMN moderation_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending' AFTER status");
        await db.query("UPDATE items SET moderation_status = 'approved'");
      }
    }

    await db.query(`
      CREATE TABLE IF NOT EXISTS item_reports (
        report_id INT AUTO_INCREMENT PRIMARY KEY,
        item_id INT NOT NULL,
        reported_by INT NOT NULL,
        reason VARCHAR(100) NOT NULL,
        details TEXT,
        status ENUM('pending', 'approved', 'dismissed') NOT NULL DEFAULT 'pending',
        reviewed_by INT NULL,
        reviewed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE,
        FOREIGN KEY (reported_by) REFERENCES users(userId) ON DELETE CASCADE,
        FOREIGN KEY (reviewed_by) REFERENCES users(userId) ON DELETE SET NULL
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS admin_activity (
        activity_id INT AUTO_INCREMENT PRIMARY KEY,
        admin_user_id INT NOT NULL,
        action_type VARCHAR(60) NOT NULL,
        action_target VARCHAR(60) NOT NULL,
        target_id INT NULL,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_user_id) REFERENCES users(userId) ON DELETE CASCADE
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        notification_id INT AUTO_INCREMENT PRIMARY KEY,
        recipient_user_id INT NULL,
        audience ENUM('user', 'admin') NOT NULL DEFAULT 'user',
        type VARCHAR(80) NOT NULL,
        title VARCHAR(160) NOT NULL,
        message TEXT NOT NULL,
        link VARCHAR(255) NULL,
        metadata_json TEXT NULL,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP NULL,
        FOREIGN KEY (recipient_user_id) REFERENCES users(userId) ON DELETE CASCADE
      )
    `);

    if (await hasTable("users") && !(await hasColumn("users", "isBlocked"))) {
      await db.query("ALTER TABLE users ADD COLUMN isBlocked BOOLEAN NOT NULL DEFAULT FALSE AFTER isActive");
    }
  } catch (error) {
    console.error("DB init failed", error.message);
  }
};
