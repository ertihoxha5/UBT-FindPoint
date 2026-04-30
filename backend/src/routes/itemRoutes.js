import express from "express";
import { addItem, uploadItem } from "../controllers/itemController.js";
import { upload } from "../config/multer.js";

const router = express.Router();

router.post("/", addItem);
router.post("/upload", upload.any(), uploadItem);

export default router;