import db from "../config/db.js";

export const findAllCategories = async () => {
  const [rows] = await db.query("SELECT category_id, name FROM categories ORDER BY name ASC");
  return rows;
};