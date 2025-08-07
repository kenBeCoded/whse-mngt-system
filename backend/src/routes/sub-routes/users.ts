//? /api/users
import { Router } from "express";
// import {
//   getUsers,
//   getUserById,
//   createUser,
// } from "../../controllers/userController.js";
import { createUser, getAllUsers, updateUser, deleteUser, getUserByUsername } from "../../controllers/users/usersController.js";
// import { authenticateToken } from "../../middleware/authToken.js";



const router = Router();

router.post("/create-user", createUser);
router.get("/get-all-users", getAllUsers)
router.post("/get-user-by-username", getUserByUsername)
router.patch("/update-user", updateUser)
router.post("/delete-user", deleteUser)

//! meh!
// router.get("/", authenticateToken, getUsers);
// router.get("/:id", getUserById);
// router.post("/", createUser);

export default router;
