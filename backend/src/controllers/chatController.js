import db from "../config/db.js";
import { createNotification } from "../repositories/notificationRepository.js";
import { requireUserId } from "../utils/auth.js";

const ensureConversationParticipant = async (conversationId, userId) => {
  const [rows] = await db.query(
    `SELECT id, user1_id, user2_id
     FROM conversations
     WHERE id = ? AND (user1_id = ? OR user2_id = ?)`,
    [conversationId, userId, userId]
  );

  return rows[0] || null;
};

export const getConversations = async (req, res) => {
  try {
    const userId = requireUserId(req);

    const [rows] = await db.query(
      `SELECT
         c.id,
         c.user1_id,
         c.user2_id,
         c.created_at,
         CASE
           WHEN c.user1_id = ? THEN u2.userId
           ELSE u1.userId
         END AS other_user_id,
         CASE
           WHEN c.user1_id = ? THEN u2.fullName
           ELSE u1.fullName
         END AS other_user_name,
         CASE
           WHEN c.user1_id = ? THEN u2.profilePictureUrl
           ELSE u1.profilePictureUrl
         END AS other_user_avatar,
         m.message AS last_message,
         m.created_at AS last_message_at
       FROM conversations c
       LEFT JOIN users u1 ON u1.userId = c.user1_id
       LEFT JOIN users u2 ON u2.userId = c.user2_id
       LEFT JOIN messages m ON m.id = (
         SELECT id
         FROM messages
         WHERE conversation_id = c.id
         ORDER BY created_at DESC, id DESC
         LIMIT 1
       )
       WHERE c.user1_id = ? OR c.user2_id = ?
       ORDER BY COALESCE(m.created_at, c.created_at) DESC, c.id DESC`,
      [userId, userId, userId, userId, userId]
    );

    res.json(rows);
  } catch (error) {
    const statusCode = error.message === "Unauthorized" ? 401 : 400;
    res.status(statusCode).json({ error: error.message });
  }
};

export const createConversation = async (req, res) => {
  try {
    const userId = requireUserId(req);
    const participantId = Number(req.body.participantId);

    if (!participantId || participantId === userId) {
      return res.status(400).json({ error: "A different participantId is required." });
    }

    const [existingRows] = await db.query(
      `SELECT id, user1_id, user2_id, created_at
       FROM conversations
       WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
       LIMIT 1`,
      [userId, participantId, participantId, userId]
    );

    if (existingRows[0]) {
      return res.json(existingRows[0]);
    }

    const [result] = await db.query("INSERT INTO conversations (user1_id, user2_id) VALUES (?, ?)", [userId, participantId]);
    res.status(201).json({
      id: result.insertId,
      user1_id: userId,
      user2_id: participantId,
    });
  } catch (error) {
    const statusCode = error.message === "Unauthorized" ? 401 : 400;
    res.status(statusCode).json({ error: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const userId = requireUserId(req);
    const conversationId = Number(req.params.conversationId);
    const conversation = await ensureConversationParticipant(conversationId, userId);

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found." });
    }

    const [rows] = await db.query(
      `SELECT m.id, m.conversation_id, m.sender_id, m.message, m.created_at, u.fullName AS sender_name
       FROM messages m
       LEFT JOIN users u ON u.userId = m.sender_id
       WHERE m.conversation_id = ?
       ORDER BY m.created_at ASC, m.id ASC`,
      [conversationId]
    );

    res.json(rows);
  } catch (error) {
    const statusCode = error.message === "Unauthorized" ? 401 : 400;
    res.status(statusCode).json({ error: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const userId = requireUserId(req);
    const conversationId = Number(req.body.conversation_id);
    const message = String(req.body.message || "").trim();

    if (!conversationId || !message) {
      return res.status(400).json({ error: "conversation_id and message are required." });
    }

    const conversation = await ensureConversationParticipant(conversationId, userId);

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found." });
    }

    const [result] = await db.query(
      "INSERT INTO messages (conversation_id, sender_id, message) VALUES (?, ?, ?)",
      [conversationId, userId, message]
    );

    const recipientUserId = conversation.user1_id === userId ? conversation.user2_id : conversation.user1_id;
    const [[senderRow]] = await db.query(
      `SELECT fullName, email
       FROM users
       WHERE userId = ?`,
      [userId]
    );

    if (recipientUserId) {
      try {
        await createNotification({
          recipientUserId,
          type: "message_received",
          title: "New message",
          message: `${senderRow?.fullName || senderRow?.email || "Someone"} sent you a message: ${message.slice(0, 80)}${message.length > 80 ? "..." : ""}`,
          link: "/home/chat",
          metadata: {
            conversationId,
            senderId: userId,
          },
        });
      } catch (notificationError) {
        console.error("Failed to create message notification:", notificationError.message);
      }
    }

    res.status(201).json({
      success: true,
      id: result.insertId,
    });
  } catch (error) {
    const statusCode = error.message === "Unauthorized" ? 401 : 400;
    res.status(statusCode).json({ error: error.message });
  }
};
