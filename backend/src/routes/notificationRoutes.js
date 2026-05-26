import express from "express";
import {
  getNotifications,
  readAllNotifications,
  readNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", getNotifications);
router.patch("/read-all", readAllNotifications);
router.patch("/:notificationId/read", readNotification);

export default router;
