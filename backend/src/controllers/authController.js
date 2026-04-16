import { registerUser, loginUser } from "../services/authService.js";

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
    const token = await loginUser(email, password);

    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};