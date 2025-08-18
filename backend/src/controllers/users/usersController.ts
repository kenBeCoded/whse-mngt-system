import { NextFunction, Request, Response } from "express";
// import pool from "../../config/database.js";
// import hashPassword from "../../utils/hashPassword.js";
import { UserModel } from "../../models/User.js";
import { User } from "../../types/index.js";

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
    // const { username, password }: { username: string; password: string } =
    //   req.body;

    // Check input
    // if (!data.username || !data.password) {
    //   res.status(400).json({ message: "username and password are required" });
    //   return;
    // }

    const result = await UserModel.create(data);

    // const test = await UserModel.updateById(3, {
    //   username: "test4",
    // });\

    // TODO : clean comment

    // TODO PRIO : to fix the response data based what frontend data-table needed

    res.status(201).json({ message: "User created successfully", data: result });
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
    res.status(200).json(users);
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
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
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
      res.status(404).json({ message: "User not found" });
      return;
    }

    const user = await UserModel.updateById(userId, req.body);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
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
      res.status(404).json({ message: "User not found" });
      return;
    }

    const user = await UserModel.deleteById(userId);

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
