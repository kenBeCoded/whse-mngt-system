import { NextFunction, Request, Response } from "express";
// import pool from "../../config/database.js";
// import hashPassword from "../../utils/hashPassword.js";
import { UserModel } from "../../models/User.js";

// signup/create local account
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username, password }: { username: string; password: string } =
      req.body;

    // Check input
    if (!username || !password) {
      res.status(400).json({ message: "username and password are required" });
      return;
    }

    await UserModel.create(username, password);

    // const test = await UserModel.updateById(3, {
    //   username: "test4",
    // });

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    next(error);
  }
};

// get all users

// update

// delete(soft)
