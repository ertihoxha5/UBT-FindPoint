import db from "../config/db.js";

export const findAllLocations = async () => {
  const [rows] = await db.query("SELECT location_id, name FROM locations ORDER BY name ASC");
  return rows;
};