import express from "express";
import {
  addItem,
  deleteMyItem,
  listItems,
  listMyItems,
  markMyItemFound,
  reportItem,
  updateMyItem,
  uploadItem,
} from "../controllers/itemController.js";
import { upload } from "../config/multer.js";

const router = express.Router();

router.get("/", listItems);
router.get("/mine", listMyItems);
router.post("/", addItem);
router.post("/upload", upload.any(), uploadItem);
router.put("/:itemId", updateMyItem);
router.patch("/:itemId/found", markMyItemFound);
router.post("/:itemId/report", reportItem);
router.delete("/:itemId", deleteMyItem);

export default router;
