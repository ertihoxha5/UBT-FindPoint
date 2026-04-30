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

export const createItem = async (item) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const canStoreUser = await hasColumn("items", "user_id");

    let result;

    if (canStoreUser) {
      [result] = await connection.query(
        `INSERT INTO items
          (title, description, type, status, category_id, location_id,date, reward, is_anonymous, user_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.title,
          item.description || null,
          item.type,
          item.status || "open",
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
          (title, description, type, status, category_id, location_id, date, reward, is_anonymous)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.title,
          item.description || null,
          item.type,
          item.status || "open",
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

    let result;

    if (canStoreUser) {
      [result] = await connection.query(
        `INSERT INTO items
          (title, description, type, status, category_id, location_id, date, reward, is_anonymous, user_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.title,
          item.description || null,
          item.type,
          item.status || "open",
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
          (title, description, type, status, category_id, location_id, date, reward, is_anonymous)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.title,
          item.description || null,
          item.type,
          item.status || "open",
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

export const getItems = async ({ type = null, status = null } = {}) => {
  const hasUserId = await hasColumn("items", "user_id");

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

  const sql = `
    SELECT
      i.item_id,
      i.title,
      i.description,
      i.type,
      i.status,
      i.category_id,
      i.location_id,
      i.date,
      i.reward,
      i.is_anonymous,
      i.created_at,
      i.updated_at,
      ${hasUserId ? "u.fullName" : "NULL"} AS fullName,
      GROUP_CONCAT(m.url ORDER BY m.created_at SEPARATOR ',') AS media_urls
    FROM items i
    ${joins.join("\n")}
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    GROUP BY
      i.item_id,
      i.title,
      i.description,
      i.type,
      i.status,
      i.category_id,
      i.location_id,
      i.date,
      i.reward,
      i.is_anonymous,
      i.created_at,
      i.updated_at,
      ${hasUserId ? "u.fullName" : "i.item_id"}
    ORDER BY i.created_at DESC
  `;

  const [rows] = await db.query(sql, params);

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