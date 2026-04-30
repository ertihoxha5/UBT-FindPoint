import { createItem, createItemWithFiles } from "../repositories/itemRepository.js";
import fs from "fs";

export const addItem = async (req, res) => {
  try {
    const payload = {
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      status: req.body.status || "open",
      category_id: Number(req.body.category_id),
      location_id: Number(req.body.location_id),
      found_date: req.body.found_date || null,
      reward: req.body.reward || null,
      is_anonymous: Boolean(req.body.is_anonymous),
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
    const payload = {
      title: req.body.title,
      description: req.body.description || "",
      type: req.body.type,
      status: "open",
      category_id: Number(req.body.category_id),
      location_id: Number(req.body.location_id),
      found_date: req.body.found_date || null,
      reward: req.body.reward || null,
      is_anonymous: req.body.is_anonymous === '1',
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