import {
  registerUser,
  loginUser,
  refreshUserTokens,
  requestPasswordReset,
  resetPassword,
} from "../services/authService.js";

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
    const tokens = await loginUser(email, password);

    res.json(tokens);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await refreshUserTokens(refreshToken);

    res.json(tokens);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await requestPasswordReset(email);

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const setNewPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    const result = await resetPassword(resetToken, newPassword);

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};