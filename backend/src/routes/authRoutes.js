import express from "express";
import { register, login, refresh, forgotPassword, setNewPassword } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", setNewPassword);

export default router;