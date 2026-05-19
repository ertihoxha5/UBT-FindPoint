import db from "../db.js";

// GET conversations (1-on-1)
export const getConversations = (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT * FROM conversations
    WHERE user1_id = ? OR user2_id = ?
  `;

  db.query(sql, [userId, userId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

// GET messages
export const getMessages = (req, res) => {
  const { conversationId } = req.params;

  db.query(
    "SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC",
    [conversationId],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
};

// SEND message
export const sendMessage = (req, res) => {
  const { conversation_id, sender_id, message } = req.body;

  const sql =
    "INSERT INTO messages (conversation_id, sender_id, message) VALUES (?, ?, ?)";

  db.query(sql, [conversation_id, sender_id, message], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
};