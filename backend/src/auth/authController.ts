import { Router, Request, Response } from "express";
import { validateLogin } from "../validation/user/user-validation.js";
import { UserModel } from "../models/User.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/tokens.js";
import { authenticateToken } from "../middleware/authToken.js";
import { AuthenticatedRequest } from "../types/index.js";

const router = Router();

// Refresh token endpoint
router.post("/refresh", (req: Request, res: Response): void => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      res.status(401).json({ message: "Refresh token required" });
      return;
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      res.status(403).json({ message: "Invalid refresh token" });
      return;
    }

    // generate new access token
    const tokenPayload = { userId: decoded.userId, username: decoded.username };
    const accessToken = generateAccessToken(tokenPayload);

    res.json({ accessToken });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// log in account
router.post(
  "/login",
  validateLogin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, password } = req.body;

      // find user
      const user = await UserModel.findByUsername(username);
      if (!user) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }

      // validate password
      const isValidPassword = await UserModel.validatePassword(user, password);
      if (!isValidPassword) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }

      // generate tokens
      const tokenPayload = { userId: user.id, username: user.username };
      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      // set refresh token cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      res.json({
        message: "Login successful",
        accessToken,
        user: {
          id: user.id,
          username: user.username,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// logout account
router.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(204).json();
});

// Get current user profile
router.get(
  "/profile",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await UserModel.findByUsername(req.user!.username);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.json({
        id: user.id,
        username: user.username,
        role: user.role,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        user_profile_image_url: user.user_profile_image_url,
        email: user.email,
      });
    } catch (error) {
      console.error("Profile error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
