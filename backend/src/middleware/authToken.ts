import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest, JWTPayload } from "../types/index.js";
import { UserModel } from "../models/User.js";
import { sendError, ErrorCodes } from "../utils/apiResponse.js";
import { getAllowedRoles } from "../config/roleAccess.js";

// Routes that skip authentication entirely
const PUBLIC_ROUTES = [
  "/api/auth/login",
  "/api/auth/refresh",
  "/api/auth/register",
  "/health",
];

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  // Skip public routes
  if (PUBLIC_ROUTES.some((route) => req.path.startsWith(route))) {
    return next();
  }

  // ── 1. Verify token ─────────────────────────────────────────────────────
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    sendError(res, 401, ErrorCodes.TOKEN_REQUIRED, "Access token required");
    return;
  }

  let decoded: JWTPayload;
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as JWTPayload;
  } catch {
    sendError(res, 403, ErrorCodes.TOKEN_INVALID, "Invalid or expired token");
    return;
  }

  // ── 2. Verify user exists ───────────────────────────────────────────────
  const user = await UserModel.findById(decoded.userId);
  if (!user || user.is_deleted) {
    sendError(res, 401, ErrorCodes.UNAUTHORIZED, "Not authorized");
    return;
  }

  // Attach user info (including role) to request
  req.user = {
    userId: decoded.userId,
    username: decoded.username,
    role: user.role,
  };

  // ── 3. Role-based authorization ─────────────────────────────────────────
  const allowedRoles = getAllowedRoles(req.method, req.path);

  if (allowedRoles === null) {
    // Route not listed in config → deny by default
    sendError(
      res,
      403,
      ErrorCodes.FORBIDDEN,
      "Access denied: route not configured",
    );
    return;
  }

  if (!allowedRoles.includes(user.role as any)) {
    sendError(
      res,
      403,
      ErrorCodes.FORBIDDEN,
      "You do not have permission to access this resource",
    );
    return;
  }

  next();
};
