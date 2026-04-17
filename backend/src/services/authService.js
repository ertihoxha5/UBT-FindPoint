import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import {
  findUserByEmail,
  createUser,
  createPasswordResetToken,
  findPasswordResetTokenByHash,
  markPasswordResetTokenUsed,
  updateUserPassword,
} from "../repositories/userRepository.js";

const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
const PASSWORD_RESET_TOKEN_TTL_MS = 15 * 60 * 1000;

const buildTokenPayload = (user) => ({
  userId: user.userId,
  email: user.email,
  role: user.role,
});

const issueTokens = (user) => ({
  accessToken: jwt.sign(buildTokenPayload(user), process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  }),
  refreshToken: jwt.sign(buildTokenPayload(user), REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  }),
});

const hashResetToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

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

  return issueTokens(user);
};

export const refreshUserTokens = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error("Refresh token is required");
  }

  const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

  return issueTokens(decoded);
};

export const requestPasswordReset = async (email) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error("User not found");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashResetToken(resetToken);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS);

  await createPasswordResetToken(user.userId, tokenHash, expiresAt);

  const response = {
    message: "Password reset token created",
  };

  if (process.env.NODE_ENV !== "production") {
    response.resetToken = resetToken;
  }

  return response;
};

export const resetPassword = async (resetToken, newPassword) => {
  if (!resetToken) {
    throw new Error("Reset token is required");
  }

  if (!newPassword) {
    throw new Error("New password is required");
  }

  const tokenHash = hashResetToken(resetToken);
  const tokenRecord = await findPasswordResetTokenByHash(tokenHash);

  if (!tokenRecord) {
    throw new Error("Invalid or expired reset token");
  }

  if (tokenRecord.usedAt) {
    throw new Error("Reset token has already been used");
  }

  if (new Date(tokenRecord.expiresAt).getTime() < Date.now()) {
    throw new Error("Invalid or expired reset token");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await updateUserPassword(tokenRecord.userId, hashedPassword);
  await markPasswordResetTokenUsed(tokenRecord.id);

  return { message: "Password updated successfully" };
};