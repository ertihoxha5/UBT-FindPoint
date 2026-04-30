import { findAllLocations } from "../repositories/locationRepository.js";

export const getLocations = async (_req, res) => {
  try {
    const locations = await findAllLocations();
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};