import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest, JWTPayload } from "../types/index.js";

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  // Public routes that don't require authentication
  const publicRoutes = [
    "/api/auth/login",
    "/api/auth/refresh",
    "/api/auth/register",
    "/health",
  ];

  if (publicRoutes.some((route) => req.path.startsWith(route))) {
    return next();
  }

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Access token required" });
    return;
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, decoded) => {
    if (err) {
      res.status(403).json({ message: "Invalid or expired token" });
      return;
    }

    req.user = decoded as JWTPayload;
    next();
  });
};
