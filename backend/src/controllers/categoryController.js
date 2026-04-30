import { findAllCategories } from "../repositories/categoryRepository.js";

export const getCategories = async (_req, res) => {
  try {
    const categories = await findAllCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};