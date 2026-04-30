import db from "../config/db.js";

export const createItem = async (item) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO items
        (title, description, type, status, category_id, location_id, found_date, reward, is_anonymous)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.title,
        item.description || null,
        item.type,
        item.status || "open",
        item.category_id,
        item.location_id,
        item.found_date || null,
        item.reward || null,
        item.is_anonymous ? 1 : 0,
      ]
    );

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

    const [result] = await connection.query(
      `INSERT INTO items
        (title, description, type, status, category_id, location_id, found_date, reward, is_anonymous)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.title,
        item.description || null,
        item.type,
        item.status || "open",
        item.category_id,
        item.location_id,
        item.found_date || null,
        item.reward || null,
        item.is_anonymous ? 1 : 0,
      ]
    );

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