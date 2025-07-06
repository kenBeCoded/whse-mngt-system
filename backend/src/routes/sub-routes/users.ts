//? /api/users
import { Router } from "express";
// import {
//   getUsers,
//   getUserById,
//   createUser,
// } from "../../controllers/userController.js";
import { signup } from "../../controllers/users/usersController.js";
import { authenticateToken } from "../../middleware/authToken.js";

const router = Router();

router.post("/create-user", signup);

//! meh!
// router.get("/", authenticateToken, getUsers);
// router.get("/:id", getUserById);
// router.post("/", createUser);

export default router;
