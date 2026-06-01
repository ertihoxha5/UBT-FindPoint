import {
  createItemReport,
  createItem,
  createItemWithFiles,
  deleteOwnedItem,
  getItemById,
  getItems,
  itemsSupportUserId,
  updateOwnedItem,
  updateOwnedItemStatus,
} from "../repositories/itemRepository.js";
import fs from "fs";
import { createAdminNotification, createNotification } from "../repositories/notificationRepository.js";
import { getUserIdFromRequest, requireUserId } from "../utils/auth.js";

export const addItem = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);

    const payload = {
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      status: req.body.status || "open",
      moderation_status: "pending",
      category_id: Number(req.body.category_id),
      location_id: Number(req.body.location_id),
      date: req.body.date || null,
      reward: req.body.reward || null,
      is_anonymous: Boolean(req.body.is_anonymous),
      user_id: userId,
      media: Array.isArray(req.body.media) ? req.body.media : [],
    };

    if (!payload.title || !payload.type || !payload.category_id || !payload.location_id) {
      return res.status(400).json({ error: "title, type, category_id and location_id are required" });
    }

    const itemId = await createItem(payload);
    await createNotification({
      recipientUserId: userId,
      type: "item_under_review",
      title: "Your report is under review",
      message: `${payload.title} was submitted and is waiting for admin approval.`,
      link: "/profile",
      metadata: { itemId, moderationStatus: "pending" },
    });
    await createAdminNotification({
      type: "admin_item_review",
      title: "New item waiting for review",
      message: `${payload.title} was submitted and needs approval.`,
      link: "/admin/items",
      metadata: { itemId, submittedBy: userId },
    });
    res.status(201).json({ message: "Item created", itemId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const uploadItem = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);

    const payload = {
      title: req.body.title,
      description: req.body.description || "",
      type: req.body.type,
      status: "open",
      moderation_status: "pending",
      category_id: Number(req.body.category_id),
      location_id: Number(req.body.location_id),
      date: req.body.date || null,
      reward: req.body.reward || null,
      is_anonymous: req.body.is_anonymous === '1',
      user_id: userId,
    };

    if (!payload.title || !payload.type || !payload.category_id || !payload.location_id) {
      // Clean up uploaded files if validation fails
      if (req.files) {
        req.files.forEach((file) => {
          try {
            fs.unlinkSync(file.path);
          } catch (err) {
            // Ignore cleanup errors
          }
        });
      }
      return res.status(400).json({ error: "title, type, category_id and location_id are required" });
    }

    // Process uploaded files
    const mediaUrls = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        // Store relative URL path for accessing files
        const relativePath = `/assets/upload/${file.filename}`;
        mediaUrls.push(relativePath);
      });
    }

    const itemId = await createItemWithFiles(payload, mediaUrls);
    await createNotification({
      recipientUserId: userId,
      type: "item_under_review",
      title: "Your report is under review",
      message: `${payload.title} was submitted and is waiting for admin approval.`,
      link: "/profile",
      metadata: { itemId, moderationStatus: "pending" },
    });
    await createAdminNotification({
      type: "admin_item_review",
      title: "New item waiting for review",
      message: `${payload.title} was submitted and needs approval.`,
      link: "/admin/items",
      metadata: { itemId, submittedBy: userId },
    });
    res.status(201).json({ message: "Item created with media", itemId });
  } catch (error) {
    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach((file) => {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          // Ignore cleanup errors
        }
      });
    }
    res.status(400).json({ error: error.message });
  }
};

export const listItems = async (req, res) => {
  try {
    let type = req.query.type ? String(req.query.type) : null;
    let status = req.query.status ? String(req.query.status) : null;
    const userId = req.query.userId ? Number(req.query.userId) : null;
    const recent = req.query.recent === "true";
    const limit = recent ? Number(req.query.limit || 6) : null;

    if (!type && (status === "lost" || status === "found")) {
      type = status;
      status = null;
    }

    const items = await getItems({ type, status, userId, limit, moderationStatus: "approved" });

    const response = items.map((item) => ({
      ...item,
      poster_name: item.is_anonymous ? "Anonymous" : item.fullName || "Unknown user",
    }));

    res.json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const listMyItems = async (req, res) => {
  try {
    const userId = requireUserId(req);
    const supportsUserId = await itemsSupportUserId();

    if (!supportsUserId) {
      return res.json([]);
    }

    const items = await getItems({ userId });

    const response = items.map((item) => ({
      ...item,
      poster_name: item.is_anonymous ? "Anonymous" : item.fullName || "Unknown user",
    }));

    res.json(response);
  } catch (error) {
    const statusCode = error.message === "Unauthorized" ? 401 : 400;
    res.status(statusCode).json({ error: error.message });
  }
};

export const updateMyItem = async (req, res) => {
  try {
    const userId = requireUserId(req);
    const itemId = Number(req.params.itemId);
    const supportsUserId = await itemsSupportUserId();

    if (!supportsUserId) {
      return res.status(400).json({ error: "Item ownership is not available in this database." });
    }

    const payload = {
      title: req.body.title,
      description: req.body.description || "",
      type: req.body.type,
      category_id: Number(req.body.category_id),
      location_id: Number(req.body.location_id),
      date: req.body.date || null,
      reward: req.body.reward || null,
      is_anonymous: req.body.is_anonymous === true || req.body.is_anonymous === "true" || req.body.is_anonymous === "1",
    };

    if (!itemId || !payload.title || !payload.type || !payload.category_id || !payload.location_id) {
      return res.status(400).json({ error: "title, type, category_id and location_id are required" });
    }

    const updated = await updateOwnedItem(itemId, userId, payload);

    if (!updated) {
      return res.status(404).json({ error: "Report not found or not owned by this user." });
    }

    await createNotification({
      recipientUserId: userId,
      type: "item_update_under_review",
      title: "Your updated report is under review",
      message: `${payload.title} was updated and is waiting for admin approval again.`,
      link: "/profile",
      metadata: { itemId, moderationStatus: "pending" },
    });
    await createAdminNotification({
      type: "admin_item_review",
      title: "Updated item waiting for review",
      message: `${payload.title} was edited and needs approval.`,
      link: "/admin/items",
      metadata: { itemId, submittedBy: userId },
    });

    res.json({ message: "Report updated" });
  } catch (error) {
    const statusCode = error.message === "Unauthorized" ? 401 : 400;
    res.status(statusCode).json({ error: error.message });
  }
};

export const markMyItemFound = async (req, res) => {
  try {
    const userId = requireUserId(req);
    const itemId = Number(req.params.itemId);
    const supportsUserId = await itemsSupportUserId();

    if (!supportsUserId) {
      return res.status(400).json({ error: "Item ownership is not available in this database." });
    }

    if (!itemId) {
      return res.status(400).json({ error: "A valid itemId is required" });
    }

    const updated = await updateOwnedItemStatus(itemId, userId, {
      status: "resolved",
      type: "found",
      moderationStatus: "approved",
    });

    if (!updated) {
      return res.status(404).json({ error: "Report not found or not owned by this user." });
    }

    const item = await getItemById(itemId);

    await createNotification({
      recipientUserId: userId,
      type: "item_marked_found",
      title: "Item marked as found",
      message: `${item?.title || "This report"} was marked as found and updated right away.`,
      link: "/profile",
      metadata: { itemId, moderationStatus: "approved", requestedStatus: "resolved" },
    });

    res.json({ message: "Report marked as found" });
  } catch (error) {
    const statusCode = error.message === "Unauthorized" ? 401 : 400;
    res.status(statusCode).json({ error: error.message });
  }
};

export const deleteMyItem = async (req, res) => {
  try {
    const userId = requireUserId(req);
    const itemId = Number(req.params.itemId);
    const supportsUserId = await itemsSupportUserId();

    if (!supportsUserId) {
      return res.status(400).json({ error: "Item ownership is not available in this database." });
    }

    if (!itemId) {
      return res.status(400).json({ error: "A valid itemId is required" });
    }

    const deleted = await deleteOwnedItem(itemId, userId);

    if (!deleted) {
      return res.status(404).json({ error: "Report not found or not owned by this user." });
    }

    res.json({ message: "Report deleted" });
  } catch (error) {
    const statusCode = error.message === "Unauthorized" ? 401 : 400;
    res.status(statusCode).json({ error: error.message });
  }
};

export const reportItem = async (req, res) => {
  try {
    const reportedBy = requireUserId(req);
    const itemId = Number(req.params.itemId);
    const reason = String(req.body.reason || "").trim();
    const details = String(req.body.details || "").trim();

    if (!itemId || !reason) {
      return res.status(400).json({ error: "A valid itemId and reason are required." });
    }

    const reportId = await createItemReport({ itemId, reportedBy, reason, details });
    const item = await getItemById(itemId);

    await createNotification({
      recipientUserId: reportedBy,
      type: "report_under_review",
      title: "Your report is under review",
      message: `Your report for ${item?.title || "this item"} was sent to admins for review.`,
      link: "/notifications",
      metadata: { itemId, reportId },
    });
    await createAdminNotification({
      type: "admin_report_review",
      title: "New user report waiting for review",
      message: `${item?.title || "An item"} was reported for "${reason}".`,
      link: "/admin/reports",
      metadata: { itemId, reportId, reportedBy },
    });

    res.status(201).json({ message: "Item reported", reportId });
  } catch (error) {
    const statusCode = error.message === "Unauthorized" ? 401 : 400;
    res.status(statusCode).json({ error: error.message });
  }
};
