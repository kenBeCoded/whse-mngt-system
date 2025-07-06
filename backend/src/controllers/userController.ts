// import { Request, Response, NextFunction } from "express";
// import { User } from "../types/index.js";

// // Mock data - replace with database calls
// const users: User[] = [
//   { id: 1, name: "John Doe", email: "john@example.com" },
//   { id: 2, name: "Jane Smith", email: "jane@example.com" },
// ];

// export const getUsers = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     res.json({
//       success: true,
//       data: users,
//       count: users.length,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// export const getUserById = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const id = parseInt(req.params.id);
//     const user = users.find((u) => u.id === id);

//     if (!user) {
//       res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//       return;
//     }

//     res.json({
//       success: true,
//       data: user,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// export const createUser = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const { name, email } = req.body;

//     if (!name || !email) {
//       res.status(400).json({
//         success: false,
//         message: "Name and email are required",
//       });
//       return;
//     }

//     const newUser: User = {
//       id: users.length + 1,
//       name,
//       email,
//     };

//     users.push(newUser);

//     res.status(201).json({
//       success: true,
//       data: newUser,
//       message: "User created successfully",
//     });
//   } catch (error) {
//     next(error);
//   }
// };
