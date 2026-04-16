import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByEmail, createUser } from "../repositories/userRepository.js";

export const registerUser = async (fullName, email, password) => {
  const existing = await findUserByEmail(email);
  if (existing) throw new Error("User already exists");

  const hashed = await bcrypt.hash(password, 10);
  const userId = await createUser(fullName, email, hashed);

  return userId;
};

export const loginUser = async (email, password) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) throw new Error("Invalid password");

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return token;
};