import { Router, Request, Response } from "express";
import { validateLogin } from "../validation/user/user-validation.js";
import { UserModel } from "../models/User.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/tokens.js";
import { AuthenticatedRequest } from "../types/index.js";
import { sendSuccess, sendError, ErrorCodes } from "../utils/apiResponse.js";

const router = Router();

// Refresh token endpoint
router.post("/refresh", (req: Request, res: Response): void => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      sendError(
        res,
        401,
        ErrorCodes.REFRESH_TOKEN_REQUIRED,
        "Refresh token required"
      );
      return;
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      sendError(
        res,
        403,
        ErrorCodes.REFRESH_TOKEN_INVALID,
        "Invalid refresh token"
      );
      return;
    }

    // generate new access token
    const tokenPayload = { userId: decoded.userId, username: decoded.username };
    const accessToken = generateAccessToken(tokenPayload);

    sendSuccess(res, 200, { accessToken });
  } catch (error) {
    console.error("Refresh error:", error);
    sendError(res, 500, ErrorCodes.INTERNAL_ERROR, "Internal server error");
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
        sendError(
          res,
          401,
          ErrorCodes.INVALID_CREDENTIALS,
          "Invalid credentials"
        );
        return;
      }

      // validate password
      const isValidPassword = await UserModel.validatePassword(user, password);
      if (!isValidPassword) {
        sendError(
          res,
          401,
          ErrorCodes.INVALID_CREDENTIALS,
          "Invalid credentials"
        );
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
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      sendSuccess(
        res,
        200,
        {
          accessToken,
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
          },
        },
        "Login successful"
      );
    } catch (error) {
      console.error("Login error:", error);
      sendError(res, 500, ErrorCodes.INTERNAL_ERROR, "Internal server error");
    }
  },
);

// logout account
router.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  });

  res.status(204).json();
});

// Get current user profile
router.get(
  "/profile",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await UserModel.findByUsername(req.user!.username);
      if (!user) {
        sendError(res, 404, ErrorCodes.USER_NOT_FOUND, "User not found");
        return;
      }

      sendSuccess(res, 200, {
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
      sendError(res, 500, ErrorCodes.INTERNAL_ERROR, "Internal server error");
    }
  },
);

export default router;
