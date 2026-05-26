import db from "../config/db.js";

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

export const itemsSupportUserId = async () => hasColumn("items", "user_id");
export const itemsSupportModerationStatus = async () => hasColumn("items", "moderation_status");

export const createItem = async (item) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const canStoreUser = await hasColumn("items", "user_id");
    const canModerate = await hasColumn("items", "moderation_status");

    let result;

    if (canStoreUser) {
      [result] = await connection.query(
        `INSERT INTO items
          (title, description, type, status, ${canModerate ? "moderation_status," : ""} category_id, location_id,date, reward, is_anonymous, user_id)
         VALUES (?, ?, ?, ?, ${canModerate ? "?, " : ""}?, ?, ?, ?, ?, ?)`,
        [
          item.title,
          item.description || null,
          item.type,
          item.status || "open",
          ...(canModerate ? [item.moderation_status || "pending"] : []),
          item.category_id,
          item.location_id,
          item.date || null,
          item.reward || null,
          item.is_anonymous ? 1 : 0,
          item.user_id || null,
        ]
      );
    } else {
      [result] = await connection.query(
        `INSERT INTO items
          (title, description, type, status, ${canModerate ? "moderation_status," : ""} category_id, location_id, date, reward, is_anonymous)
         VALUES (?, ?, ?, ?, ${canModerate ? "?, " : ""}?, ?, ?, ?, ?)`,
        [
          item.title,
          item.description || null,
          item.type,
          item.status || "open",
          ...(canModerate ? [item.moderation_status || "pending"] : []),
          item.category_id,
          item.location_id,
          item.date || null,
          item.reward || null,
          item.is_anonymous ? 1 : 0,
        ]
      );
    }

    const itemId = result.insertId;

    if (Array.isArray(item.media) && item.media.length > 0) {
      for (const mediaItem of item.media) {
        if (!mediaItem?.url) {
          continue;
        }

        await connection.query("INSERT INTO media (item_id, url) VALUES (?, ?)", [itemId, mediaItem.url]);
      }
    }

    await connection.commit();
    return itemId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const createItemWithFiles = async (item, mediaUrls) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const canStoreUser = await hasColumn("items", "user_id");
    const canModerate = await hasColumn("items", "moderation_status");

    let result;

    if (canStoreUser) {
      [result] = await connection.query(
        `INSERT INTO items
          (title, description, type, status, ${canModerate ? "moderation_status," : ""} category_id, location_id, date, reward, is_anonymous, user_id)
         VALUES (?, ?, ?, ?, ${canModerate ? "?, " : ""}?, ?, ?, ?, ?, ?)`,
        [
          item.title,
          item.description || null,
          item.type,
          item.status || "open",
          ...(canModerate ? [item.moderation_status || "pending"] : []),
          item.category_id,
          item.location_id,
          item.date || null,
          item.reward || null,
          item.is_anonymous ? 1 : 0,
          item.user_id || null,
        ]
      );
    } else {
      [result] = await connection.query(
        `INSERT INTO items
          (title, description, type, status, ${canModerate ? "moderation_status," : ""} category_id, location_id, date, reward, is_anonymous)
         VALUES (?, ?, ?, ?, ${canModerate ? "?, " : ""}?, ?, ?, ?, ?)`,
        [
          item.title,
          item.description || null,
          item.type,
          item.status || "open",
          ...(canModerate ? [item.moderation_status || "pending"] : []),
          item.category_id,
          item.location_id,
          item.date || null,
          item.reward || null,
          item.is_anonymous ? 1 : 0,
        ]
      );
    }

    const itemId = result.insertId;

    if (Array.isArray(mediaUrls) && mediaUrls.length > 0) {
      for (const url of mediaUrls) {
        if (!url) {
          continue;
        }

        await connection.query("INSERT INTO media (item_id, url) VALUES (?, ?)", [itemId, url]);
      }
    }

    await connection.commit();
    return itemId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const getItems = async ({ type = null, status = null, userId = null, limit = null, moderationStatus = null } = {}) => {
  const hasUserId = await itemsSupportUserId();
  const hasModerationStatus = await itemsSupportModerationStatus();

  const joins = ["LEFT JOIN media m ON m.item_id = i.item_id"];
  const where = [];
  const params = [];

  if (hasUserId) {
    joins.push("LEFT JOIN users u ON u.userId = i.user_id");
  }

  if (type) {
    where.push("i.type = ?");
    params.push(type);
  }

  if (status) {
    where.push("i.status = ?");
    params.push(status);
  }

  if (userId && hasUserId) {
    where.push("i.user_id = ?");
    params.push(userId);
  }

  if (moderationStatus && hasModerationStatus) {
    where.push("i.moderation_status = ?");
    params.push(moderationStatus);
  }

  const sql = `
    SELECT
      i.item_id,
      ${hasUserId ? "i.user_id" : "NULL"} AS user_id,
      i.title,
      i.description,
      i.type,
      i.status,
      ${hasModerationStatus ? "i.moderation_status," : "'approved' AS moderation_status,"}
      i.category_id,
      i.location_id,
      i.date,
      i.reward,
      i.is_anonymous,
      i.created_at,
      i.updated_at,
      c.name AS category_name,
      l.name AS location_name,
      ${hasUserId ? "u.fullName" : "NULL"} AS fullName,
      GROUP_CONCAT(m.url ORDER BY m.created_at SEPARATOR ',') AS media_urls
    FROM items i
    LEFT JOIN categories c ON c.category_id = i.category_id
    LEFT JOIN locations l ON l.location_id = i.location_id
    ${joins.join("\n")}
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    GROUP BY
      i.item_id,
      ${hasUserId ? "i.user_id," : ""}
      i.title,
      i.description,
      i.type,
      i.status,
      ${hasModerationStatus ? "i.moderation_status," : ""}
      i.category_id,
      i.location_id,
      i.date,
      i.reward,
      i.is_anonymous,
      i.created_at,
      i.updated_at,
      c.name,
      l.name,
      ${hasUserId ? "u.fullName" : "i.item_id"}
    ORDER BY i.created_at DESC
    ${limit ? "LIMIT ?" : ""}
  `;

  const [rows] = await db.query(sql, limit ? [...params, limit] : params);

  return rows.map((row) => ({
    ...row,
    date: row.date,
    media: row.media_urls
      ? String(row.media_urls)
          .split(",")
          .filter(Boolean)
          .map((url) => ({ url }))
      : [],
  }));
};

export const updateOwnedItem = async (itemId, userId, payload) => {
  const [result] = await db.query(
    `UPDATE items
     SET
       title = ?,
       description = ?,
       type = ?,
       category_id = ?,
       location_id = ?,
       date = ?,
       reward = ?,
       is_anonymous = ?,
       moderation_status = 'pending'
     WHERE item_id = ? AND user_id = ?`,
    [
      payload.title,
      payload.description || null,
      payload.type,
      payload.category_id,
      payload.location_id,
      payload.date || null,
      payload.reward || null,
      payload.is_anonymous ? 1 : 0,
      itemId,
      userId,
    ]
  );

  return result.affectedRows > 0;
};

export const updateOwnedItemStatus = async (itemId, userId, { status, type = null }) => {
  const [result] = await db.query(
    `UPDATE items
     SET status = ?, type = COALESCE(?, type), moderation_status = 'pending'
     WHERE item_id = ? AND user_id = ?`,
    [status, type, itemId, userId]
  );

  return result.affectedRows > 0;
};

export const deleteOwnedItem = async (itemId, userId) => {
  const [result] = await db.query("DELETE FROM items WHERE item_id = ? AND user_id = ?", [itemId, userId]);
  return result.affectedRows > 0;
};

export const getItemById = async (itemId) => {
  const items = await getItems({});
  return items.find((item) => Number(item.item_id) === Number(itemId)) || null;
};

export const listItemsForAdmin = async ({ search = "", moderationStatus = "all", type = "all" } = {}) => {
  const hasModerationStatus = await itemsSupportModerationStatus();
  const where = [];
  const params = [];

  if (search) {
    where.push("(i.title LIKE ? OR i.description LIKE ? OR u.fullName LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (type !== "all") {
    where.push("i.type = ?");
    params.push(type);
  }

  if (moderationStatus !== "all" && hasModerationStatus) {
    where.push("i.moderation_status = ?");
    params.push(moderationStatus);
  }

  const [rows] = await db.query(
    `SELECT
      i.item_id,
      i.user_id,
      i.title,
      i.description,
      i.type,
      i.status,
      ${hasModerationStatus ? "i.moderation_status," : "'approved' AS moderation_status,"}
      i.category_id,
      i.location_id,
      i.date,
      i.reward,
      i.is_anonymous,
      i.created_at,
      i.updated_at,
      c.name AS category_name,
      l.name AS location_name,
      u.fullName,
      u.email,
      COALESCE(report_counts.reportCount, 0) AS report_count,
      GROUP_CONCAT(m.url ORDER BY m.created_at SEPARATOR ',') AS media_urls
     FROM items i
     LEFT JOIN categories c ON c.category_id = i.category_id
     LEFT JOIN locations l ON l.location_id = i.location_id
     LEFT JOIN users u ON u.userId = i.user_id
     LEFT JOIN media m ON m.item_id = i.item_id
     LEFT JOIN (
       SELECT item_id, COUNT(*) AS reportCount
       FROM item_reports
       WHERE status = 'pending'
       GROUP BY item_id
     ) report_counts ON report_counts.item_id = i.item_id
     ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
     GROUP BY
      i.item_id, i.user_id, i.title, i.description, i.type, i.status,
      ${hasModerationStatus ? "i.moderation_status," : ""}
      i.category_id, i.location_id, i.date, i.reward, i.is_anonymous, i.created_at, i.updated_at,
      c.name, l.name, u.fullName, u.email, report_counts.reportCount
     ORDER BY i.created_at DESC`,
    params
  );

  return rows.map((row) => ({
    ...row,
    media: row.media_urls
      ? String(row.media_urls)
          .split(",")
          .filter(Boolean)
          .map((url) => ({ url }))
      : [],
  }));
};

export const updateItemByAdmin = async (itemId, payload) => {
  const hasModerationStatus = await itemsSupportModerationStatus();
  await db.query(
    `UPDATE items
     SET
       title = ?,
       description = ?,
       type = ?,
       status = ?,
       ${hasModerationStatus ? "moderation_status = ?," : ""}
       category_id = ?,
       location_id = ?,
       date = ?,
       reward = ?,
       is_anonymous = ?
     WHERE item_id = ?`,
    [
      payload.title,
      payload.description || null,
      payload.type,
      payload.status,
      ...(hasModerationStatus ? [payload.moderation_status] : []),
      payload.category_id,
      payload.location_id,
      payload.date || null,
      payload.reward || null,
      payload.is_anonymous ? 1 : 0,
      itemId,
    ]
  );
};

export const setItemModerationStatus = async (itemId, moderationStatus) => {
  const hasModerationStatus = await itemsSupportModerationStatus();
  if (!hasModerationStatus) {
    return;
  }

  await db.query("UPDATE items SET moderation_status = ? WHERE item_id = ?", [moderationStatus, itemId]);
};

export const deleteItemByAdmin = async (itemId) => {
  await db.query("DELETE FROM items WHERE item_id = ?", [itemId]);
};

export const createItemReport = async ({ itemId, reportedBy, reason, details }) => {
  const [result] = await db.query(
    `INSERT INTO item_reports (item_id, reported_by, reason, details)
     VALUES (?, ?, ?, ?)`,
    [itemId, reportedBy, reason, details || null]
  );

  return result.insertId;
};
