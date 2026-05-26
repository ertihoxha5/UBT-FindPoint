import { getPublicDashboardStats } from "../repositories/adminRepository.js";
import { requireUserId } from "../utils/auth.js";

export const getDashboardStatsPublic = async (req, res) => {
  try {
    requireUserId(req);
    const stats = await getPublicDashboardStats();
    res.json(stats);
  } catch (error) {
    const statusCode = error.message === "Unauthorized" ? 401 : 400;
    res.status(statusCode).json({ error: error.message });
  }
};
