import jwt from "jsonwebtoken";
import { JWTPayload } from "../types/index.js";

export const generateAccessToken = (
  payload: Omit<JWTPayload, "iat" | "exp">,
): string => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: "7d",
  });
};
