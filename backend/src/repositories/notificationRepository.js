import db from "../config/db.js";

export const createNotification = async ({
  recipientUserId = null,
  audience = "user",
  type,
  title,
  message,
  link = null,
  metadata = null,
}) => {
  const serializedMetadata = metadata ? JSON.stringify(metadata) : null;

  const [result] = await db.query(
    `INSERT INTO notifications
      (recipient_user_id, audience, type, title, message, link, metadata_json)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [recipientUserId, audience, type, title, message, link, serializedMetadata]
  );

  return result.insertId;
};

export const createAdminNotification = async (payload) =>
  createNotification({
    ...payload,
    recipientUserId: null,
    audience: "admin",
  });

export const listNotificationsForUser = async ({ userId, isAdmin = false }) => {
  const params = [userId];
  const conditions = ["n.recipient_user_id = ?"];

  if (isAdmin) {
    conditions.push("n.audience = 'admin'");
  }

  const [rows] = await db.query(
    `SELECT
      n.notification_id,
      n.recipient_user_id,
      n.audience,
      n.type,
      n.title,
      n.message,
      n.link,
      n.metadata_json,
      n.is_read,
      n.created_at,
      n.read_at
     FROM notifications n
     WHERE ${conditions.join(" OR ")}
     ORDER BY n.created_at DESC
     LIMIT 100`,
    params
  );

  return rows.map((row) => ({
    ...row,
    metadata: row.metadata_json ? JSON.parse(row.metadata_json) : null,
  }));
};

export const getUnreadNotificationCount = async ({ userId, isAdmin = false }) => {
  const params = [userId];
  const conditions = ["recipient_user_id = ?"];

  if (isAdmin) {
    conditions.push("audience = 'admin'");
  }

  const [[row]] = await db.query(
    `SELECT COUNT(*) AS unreadCount
     FROM notifications
     WHERE is_read = 0 AND (${conditions.join(" OR ")})`,
    params
  );

  return Number(row?.unreadCount || 0);
};

export const markNotificationRead = async ({ notificationId, userId, isAdmin = false }) => {
  const params = [notificationId, userId];
  let sql = `
    UPDATE notifications
    SET is_read = 1, read_at = NOW()
    WHERE notification_id = ?
      AND (recipient_user_id = ?`;

  if (isAdmin) {
    sql += ` OR audience = 'admin'`;
  }

  sql += `)`;

  const [result] = await db.query(sql, params);
  return result.affectedRows > 0;
};

export const markAllNotificationsRead = async ({ userId, isAdmin = false }) => {
  const params = [userId];
  let sql = `
    UPDATE notifications
    SET is_read = 1, read_at = NOW()
    WHERE is_read = 0
      AND (recipient_user_id = ?`;

  if (isAdmin) {
    sql += ` OR audience = 'admin'`;
  }

  sql += `)`;

  const [result] = await db.query(sql, params);
  return result.affectedRows;
};
