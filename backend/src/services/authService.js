import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  findUserByEmail,
  createUser,
  findUserById,
  updateUserLastLogin,
  updateUserProfile,
  deleteUserAccount,
  updateUserPassword,
} from "../repositories/userRepository.js";

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
  if (user.isBlocked) throw new Error("Account blocked");

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) throw new Error("Invalid password");

  const accessToken = jwt.sign(
    { userId: user.userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  const refreshToken = jwt.sign(
    { userId: user.userId, type: "refresh" },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );

  await updateUserLastLogin(user.userId);

  return {
    token: accessToken,
    accessToken,
    refreshToken,
    user: await getUserProfile(user.userId),
  };
};

export const getUserProfile = async (userId) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  return {
    userId: user.userId,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    faculty: user.profileFaculty || user.faculty || "",
    phoneNumber: user.profilePhoneNumber || user.phoneNumber || "",
    bio: user.bio || "",
    profilePictureUrl: user.avatar_url || user.profilePictureUrl || "",
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
    isActive: Boolean(user.isActive),
    isBlocked: Boolean(user.isBlocked),
    profileUpdatedAt: user.profileUpdatedAt || null,
  };
};

export const saveUserProfile = async (userId, payload) => {
  const currentUser = await findUserById(userId);

  if (!currentUser) {
    throw new Error("User not found");
  }

  await updateUserProfile(userId, {
    fullName: payload.fullName?.trim() || currentUser.fullName,
    faculty: payload.faculty?.trim() || "",
    phoneNumber: payload.phoneNumber?.trim() || "",
    bio: payload.bio?.trim() || "",
    profilePictureUrl: payload.profilePictureUrl || currentUser.avatar_url || currentUser.profilePictureUrl || "",
  });

  return getUserProfile(userId);
};

export const removeUserAccount = async (userId) => {
  const currentUser = await findUserById(userId);

  if (!currentUser) {
    throw new Error("User not found");
  }

  await deleteUserAccount(userId);
};

export const updatePasswordByEmail = async ({ email, newPassword }) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error("User not found");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await updateUserPassword(user.userId, hashedPassword);

  return { message: "Password updated" };
};
