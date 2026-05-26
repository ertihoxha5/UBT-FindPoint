import express from "express";
import {
  approveAdminItem,
  deleteAdminItem,
  deleteAdminUser,
  downloadAdminDashboardPdf,
  getAdminDashboard,
  getAdminItemDetails,
  getAdminItems,
  getAdminReports,
  getAdminUsers,
  moderateAdminItem,
  reviewAdminReport,
  toggleAdminUserBlock,
  updateAdminItem,
  updateAdminUser,
} from "../controllers/adminController.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(requireAdmin);

router.get("/dashboard", getAdminDashboard);
router.get("/dashboard/report.pdf", downloadAdminDashboardPdf);

router.get("/users", getAdminUsers);
router.put("/users/:userId", updateAdminUser);
router.patch("/users/:userId/block", toggleAdminUserBlock);
router.delete("/users/:userId", deleteAdminUser);

router.get("/items", getAdminItems);
router.get("/items/:itemId", getAdminItemDetails);
router.put("/items/:itemId", updateAdminItem);
router.patch("/items/:itemId/approve", approveAdminItem);
router.patch("/items/:itemId/moderate", moderateAdminItem);
router.delete("/items/:itemId", deleteAdminItem);

router.get("/reports", getAdminReports);
router.patch("/reports/:reportId", reviewAdminReport);

export default router;
