import jwt from "jsonwebtoken";
import { JWTPayload } from "../types/index.js";

export const generateAccessToken = (
  payload: Omit<JWTPayload, "iat" | "exp">,
): string => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, {
    // Only apply expiration if NOT in development
    ...(process.env.NODE_ENV === "development" ? {} : { expiresIn: "15m" }),
  });
};

export const generateRefreshToken = (
  payload: Omit<JWTPayload, "iat" | "exp">,
): string => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: "30d",
  });
};

export const verifyRefreshToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as JWTPayload;
  } catch (error) {
    return null;
  }
};
