import express from "express";
import { addItem, uploadItem, listItems } from "../controllers/itemController.js";
import { upload } from "../config/multer.js";

const router = express.Router();

router.get("/", listItems);
router.post("/", addItem);
router.post("/upload", upload.any(), uploadItem);

export default router;