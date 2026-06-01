import fs from "fs";
import {
  registerUser,
  loginUser,
  getUserProfile,
  saveUserProfile,
  removeUserAccount,
  updatePasswordByEmail,
} from "../services/authService.js";
import { requireUserId } from "../utils/auth.js";

export const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const userId = await registerUser(fullName, email, password);

    res.status(201).json({ message: "User created", userId });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await loginUser(email, password);

    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const me = async (req, res) => {
  try {
    const userId = requireUserId(req);
    const user = await getUserProfile(userId);

    res.json(user);
  } catch (err) {
    const statusCode = err.message === "Unauthorized" ? 401 : 400;
    res.status(statusCode).json({ error: err.message });
  }
};

export const updateMe = async (req, res) => {
  try {
    const userId = requireUserId(req);
    const profilePictureUrl = req.file ? `/assets/upload/${req.file.filename}` : req.body.profilePictureUrl;

    const user = await saveUserProfile(userId, {
      fullName: req.body.fullName,
      faculty: req.body.faculty,
      phoneNumber: req.body.phoneNumber,
      bio: req.body.bio,
      profilePictureUrl,
    });

    res.json(user);
  } catch (err) {
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {}
    }

    const statusCode = err.message === "Unauthorized" ? 401 : 400;
    res.status(statusCode).json({ error: err.message });
  }
};

export const deleteMe = async (req, res) => {
  try {
    const userId = requireUserId(req);

    await removeUserAccount(userId);

    res.json({ message: "Account deleted" });
  } catch (err) {
    const statusCode = err.message === "Unauthorized" ? 401 : 400;
    res.status(statusCode).json({ error: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim();
    const newPassword = String(req.body.newPassword || "").trim();
    const confirmPassword = String(req.body.confirmPassword || "").trim();

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: "Email, newPassword, and confirmPassword are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const result = await updatePasswordByEmail({ email, newPassword });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
