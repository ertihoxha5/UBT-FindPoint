import express from "express";
import {
  createConversation,
  getConversations,
  getMessages,
  sendMessage
} from "../controllers/chatController.js";

const router = express.Router();

router.get("/conversations", getConversations);
router.post("/conversations", createConversation);
router.get("/messages/:conversationId", getMessages);
router.post("/messages", sendMessage);

export default router;
