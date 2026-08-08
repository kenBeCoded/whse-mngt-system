import { NextFunction, Request, Response } from "express";
import { UserModel } from "../../models/User.js";
import { User, AuthenticatedRequest } from "../../types/index.js";
import { sendSuccess, sendError, ErrorCodes } from "../../utils/apiResponse.js";

// signup/create local account
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data: Omit<User, "id" | "created_at" | "updated_at"> & {
      password: string;
      role: string;
    } = req.body;

    const result = await UserModel.create(data);

    sendSuccess(res, 201, result, "User created successfully");
  } catch (error) {
    next(error);
  }
};

// get all users
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await UserModel.findAllUsernames();
    sendSuccess(res, 200, users);
  } catch (error) {
    next(error);
  }
};

// get user by username
export const getUserByUsername = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username } = req.body;
    const user = await UserModel.findByUsername(username);
    if (!user) {
      sendError(res, 404, ErrorCodes.USER_NOT_FOUND, "User not found");
      return;
    }

    sendSuccess(res, 200, user);
  } catch (error) {
    next(error);
  }
};

// update user
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username } = req.body;
    const userId = await UserModel.getIdByUsername(username);
    if (!userId) {
      sendError(res, 404, ErrorCodes.USER_NOT_FOUND, "User not found");
      return;
    }

    const user = await UserModel.updateById(userId, req.body);
    if (!user) {
      sendError(res, 404, ErrorCodes.USER_NOT_FOUND, "User not found");
      return;
    }

    sendSuccess(res, 200, user, "User updated successfully");
  } catch (error) {
    next(error);
  }
};

// delete(soft)
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username } = req.body;
    const userId = await UserModel.getIdByUsername(username);
    if (!userId) {
      sendError(res, 404, ErrorCodes.USER_NOT_FOUND, "User not found");
      return;
    }

    await UserModel.deleteById(userId);

    sendSuccess(res, 200, null, "User deleted successfully");
  } catch (error) {
    next(error);
  }
};

// delete multiple (soft)
export const deleteMultipleUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { user_ids } = req.body; // array of user_account_ids
    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      sendError(res, 400, ErrorCodes.BAD_REQUEST, "Invalid or empty user_ids array");
      return;
    }

    await UserModel.deleteMultipleByUserAccountIds(user_ids);

    sendSuccess(res, 200, null, "Users deleted successfully");
  } catch (error) {
    next(error);
  }
};
// update own profile (any role)
export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, 401, ErrorCodes.UNAUTHORIZED, "Unauthorized");
      return;
    }

    const { first_name, middle_name, last_name, email, gender, user_profile_image_url } = req.body;
    const updated = await UserModel.updateProfile(userId, {
      first_name,
      middle_name,
      last_name,
      email,
      gender,
      user_profile_image_url,
    });

    if (!updated) {
      sendError(res, 404, ErrorCodes.USER_NOT_FOUND, "User not found");
      return;
    }

    sendSuccess(res, 200, updated, "Profile updated successfully");
  } catch (error) {
    next(error);
  }
};

// update own password (any role)
export const updatePassword = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, 401, ErrorCodes.UNAUTHORIZED, "Unauthorized");
      return;
    }

    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      sendError(res, 400, ErrorCodes.BAD_REQUEST, "current_password and new_password are required");
      return;
    }

    // Fetch user to validate current password
    const user = await UserModel.findById(userId);
    if (!user) {
      sendError(res, 404, ErrorCodes.USER_NOT_FOUND, "User not found");
      return;
    }

    const isValid = await UserModel.validatePassword(user, current_password);
    if (!isValid) {
      sendError(res, 400, ErrorCodes.INVALID_CREDENTIALS, "Current password is incorrect");
      return;
    }

    await UserModel.updatePassword(userId, new_password);
    sendSuccess(res, 200, null, "Password updated successfully");
  } catch (error) {
    next(error);
  }
};
