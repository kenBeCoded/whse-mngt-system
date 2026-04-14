import { NextFunction, Request, Response } from "express";
import { UserModel } from "../../models/User.js";
import { User } from "../../types/index.js";
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
