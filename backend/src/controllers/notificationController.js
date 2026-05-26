import { findUserById } from "../repositories/userRepository.js";
import {
  getUnreadNotificationCount,
  listNotificationsForUser,
  markAllNotificationsRead,
  markNotificationRead,
} from "../repositories/notificationRepository.js";
import { requireUserId } from "../utils/auth.js";

const getNotificationContext = async (req) => {
  const userId = requireUserId(req);
  const user = await findUserById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  return {
    userId,
    isAdmin: user.role === "admin",
  };
};

export const getNotifications = async (req, res) => {
  try {
    const context = await getNotificationContext(req);
    const [notifications, unreadCount] = await Promise.all([
      listNotificationsForUser(context),
      getUnreadNotificationCount(context),
    ]);

    res.json({ notifications, unreadCount });
  } catch (error) {
    const statusCode = error.message === "Unauthorized" ? 401 : 400;
    res.status(statusCode).json({ error: error.message });
  }
};

export const readNotification = async (req, res) => {
  try {
    const context = await getNotificationContext(req);
    const notificationId = Number(req.params.notificationId);

    if (!notificationId) {
      return res.status(400).json({ error: "A valid notificationId is required." });
    }

    const updated = await markNotificationRead({
      notificationId,
      ...context,
    });

    if (!updated) {
      return res.status(404).json({ error: "Notification not found." });
    }

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    const statusCode = error.message === "Unauthorized" ? 401 : 400;
    res.status(statusCode).json({ error: error.message });
  }
};

export const readAllNotifications = async (req, res) => {
  try {
    const context = await getNotificationContext(req);
    const updatedCount = await markAllNotificationsRead(context);

    res.json({ message: "Notifications marked as read", updatedCount });
  } catch (error) {
    const statusCode = error.message === "Unauthorized" ? 401 : 400;
    res.status(statusCode).json({ error: error.message });
  }
};
