import { findUserById } from "../repositories/userRepository.js";
import { requireUserId } from "../utils/auth.js";

export const requireAdmin = async (req, res, next) => {
  try {
    const userId = requireUserId(req);
    const user = await findUserById(userId);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    req.adminUser = user;
    next();
  } catch (error) {
    const statusCode = error.message === "Unauthorized" ? 401 : 400;
    res.status(statusCode).json({ error: error.message });
  }
};
