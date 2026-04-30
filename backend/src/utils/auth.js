import jwt from "jsonwebtoken";

export const getUserIdFromRequest = (req) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload?.userId || null;
  } catch {
    return null;
  }
};

export const requireUserId = (req) => {
  const userId = getUserIdFromRequest(req);

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return userId;
};
