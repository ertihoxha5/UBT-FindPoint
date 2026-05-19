import jwt from "jsonwebtoken";

export const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization || "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const queryToken = typeof req.query?.token === "string" ? req.query.token : null;
  return bearerToken || queryToken;
};

export const getUserIdFromRequest = (req) => {
  const token = getTokenFromRequest(req);

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
