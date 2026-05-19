import express from "express";
import {
  getConversations,
  getMessages,
  sendMessage
} from "../controllers/chatController.js";

const router = express.Router();

router.get("/conversations/:userId", getConversations);
router.get("/messages/:conversationId", getMessages);
router.post("/messages", sendMessage);

export default router;