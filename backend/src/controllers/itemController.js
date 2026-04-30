import jwt from "jsonwebtoken";
import { createItem, createItemWithFiles, getItems } from "../repositories/itemRepository.js";
import fs from "fs";

const getUserIdFromRequest = (req) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload?.userId || null;
  } catch {
    return null;
  }
};

export const addItem = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);

    const payload = {
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      status: req.body.status || "open",
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

    // Support callers that use status=lost/found to mean type.
    if (!type && (status === "lost" || status === "found")) {
      type = status;
      status = null;
    }

    const items = await getItems({ type, status });

    const response = items.map((item) => ({
      ...item,
      poster_name: item.is_anonymous ? "Anonymous" : item.fullName || "Unknown user",
    }));

    res.json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};