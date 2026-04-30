import express from "express";
import { register, login, me, updateMe, deleteMe } from "../controllers/authController.js";
import { upload } from "../config/multer.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", me);
router.put("/me", upload.single("profilePhoto"), updateMe);
router.delete("/me", deleteMe);

export default router;
