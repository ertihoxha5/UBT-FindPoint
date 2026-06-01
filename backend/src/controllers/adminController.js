import {
  buildDashboardPdf,
  getDashboardStats,
  listReportsForAdmin,
  logAdminActivity,
  reviewReportByAdmin,
} from "../repositories/adminRepository.js";
import { createNotification } from "../repositories/notificationRepository.js";
import {
  deleteItemByAdmin,
  getItemById,
  listItemsForAdmin,
  setItemModerationStatus,
  updateItemByAdmin,
} from "../repositories/itemRepository.js";
import {
  deleteUserAccount,
  findUserById,
  listUsersForAdmin,
  setUserBlockedState,
  updateUserByAdmin,
} from "../repositories/userRepository.js";

export const getAdminDashboard = async (req, res) => {
  try {
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const downloadAdminDashboardPdf = async (req, res) => {
  try {
    const pdfBuffer = await buildDashboardPdf();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="admin-dashboard-report.pdf"');
    res.send(pdfBuffer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    const users = await listUsersForAdmin({
      search: String(req.query.search || "").trim(),
      status: String(req.query.status || "all"),
      role: String(req.query.role || "all"),
    });
    res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateAdminUser = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const existing = await findUserById(userId);

    if (!existing) {
      return res.status(404).json({ error: "User not found" });
    }

    const payload = {
      fullName: String(req.body.fullName || existing.fullName).trim(),
      email: String(req.body.email || existing.email).trim(),
      role: req.body.role === "admin" ? "admin" : "user",
      faculty: String(req.body.faculty || existing.profileFaculty || existing.faculty || "").trim(),
      phoneNumber: String(req.body.phoneNumber || existing.profilePhoneNumber || existing.phoneNumber || "").trim(),
      bio: String(req.body.bio || existing.bio || "").trim(),
      isBlocked: req.body.isBlocked === true || req.body.isBlocked === "true",
      isActive: !(req.body.isBlocked === true || req.body.isBlocked === "true"),
    };

    await updateUserByAdmin(userId, payload);
    await logAdminActivity({
      adminUserId: req.adminUser.userId,
      actionType: "updated",
      actionTarget: "user",
      targetId: userId,
      details: payload.email,
    });

    res.json({ message: "User updated" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteAdminUser = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    await deleteUserAccount(userId);
    await logAdminActivity({
      adminUserId: req.adminUser.userId,
      actionType: "deleted",
      actionTarget: "user",
      targetId: userId,
    });
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const toggleAdminUserBlock = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const isBlocked = req.body.isBlocked === true || req.body.isBlocked === "true";
    await setUserBlockedState(userId, isBlocked);
    await logAdminActivity({
      adminUserId: req.adminUser.userId,
      actionType: isBlocked ? "blocked" : "unblocked",
      actionTarget: "user",
      targetId: userId,
    });
    res.json({ message: isBlocked ? "User blocked" : "User unblocked" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAdminItems = async (req, res) => {
  try {
    const items = await listItemsForAdmin({
      search: String(req.query.search || "").trim(),
      moderationStatus: String(req.query.moderationStatus || "all"),
      type: String(req.query.type || "all"),
      status: String(req.query.status || "all"),
    });
    res.json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAdminItemDetails = async (req, res) => {
  try {
    const itemId = Number(req.params.itemId);
    const items = await listItemsForAdmin({});
    const item = items.find((entry) => Number(entry.item_id) === itemId);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateAdminItem = async (req, res) => {
  try {
    const itemId = Number(req.params.itemId);
    await updateItemByAdmin(itemId, {
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      status: req.body.status,
      moderation_status: req.body.moderation_status,
      category_id: Number(req.body.category_id),
      location_id: Number(req.body.location_id),
      date: req.body.date || null,
      reward: req.body.reward || null,
      is_anonymous: req.body.is_anonymous === true || req.body.is_anonymous === "true",
    });
    await logAdminActivity({
      adminUserId: req.adminUser.userId,
      actionType: "updated",
      actionTarget: "item",
      targetId: itemId,
    });
    res.json({ message: "Item updated" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const approveAdminItem = async (req, res) => {
  try {
    const itemId = Number(req.params.itemId);
    await setItemModerationStatus(itemId, "approved");
    const item = await getItemById(itemId);

    if (item?.user_id) {
      await createNotification({
        recipientUserId: item.user_id,
        type: "item_approved",
        title: "Your report was approved",
        message: `${item.title} is now visible to other users.`,
        link: "/profile",
        metadata: { itemId },
      });
    }

    await logAdminActivity({
      adminUserId: req.adminUser.userId,
      actionType: "approved",
      actionTarget: "item",
      targetId: itemId,
    });
    res.json({ message: "Item approved" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const moderateAdminItem = async (req, res) => {
  try {
    const itemId = Number(req.params.itemId);
    const moderationStatus = req.body.status === "approved" ? "approved" : "rejected";

    await setItemModerationStatus(itemId, moderationStatus);

    const item = await getItemById(itemId);
    if (item?.user_id) {
      await createNotification({
        recipientUserId: item.user_id,
        type: moderationStatus === "approved" ? "item_approved" : "item_rejected",
        title: moderationStatus === "approved" ? "Your report was approved" : "Your report was rejected",
        message:
          moderationStatus === "approved"
            ? `${item.title} is now visible to other users.`
            : `${item.title} needs changes before it can be published again.`,
        link: "/profile",
        metadata: { itemId, moderationStatus },
      });
    }

    await logAdminActivity({
      adminUserId: req.adminUser.userId,
      actionType: moderationStatus,
      actionTarget: "item",
      targetId: itemId,
    });

    res.json({ message: `Item ${moderationStatus}` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteAdminItem = async (req, res) => {
  try {
    const itemId = Number(req.params.itemId);
    await deleteItemByAdmin(itemId);
    await logAdminActivity({
      adminUserId: req.adminUser.userId,
      actionType: "deleted",
      actionTarget: "item",
      targetId: itemId,
    });
    res.json({ message: "Item deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAdminReports = async (req, res) => {
  try {
    const reports = await listReportsForAdmin({
      status: String(req.query.status || "all"),
    });
    res.json(reports);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const reviewAdminReport = async (req, res) => {
  try {
    const reportId = Number(req.params.reportId);
    const status = req.body.status === "approved" ? "approved" : "dismissed";
    await reviewReportByAdmin({
      reportId,
      status,
      reviewedBy: req.adminUser.userId,
    });
    await logAdminActivity({
      adminUserId: req.adminUser.userId,
      actionType: status === "approved" ? "approved" : "dismissed",
      actionTarget: "report",
      targetId: reportId,
    });

    res.json({ message: "Report updated" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
