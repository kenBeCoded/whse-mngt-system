//? /api/users
import { Router } from "express";
// import {
//   getUsers,
//   getUserById,
//   createUser,
// } from "../../controllers/userController.js";
import { signup, getAllUsers, updateUser } from "../../controllers/users/usersController.js";
// import { authenticateToken } from "../../middleware/authToken.js";



const router = Router();

router.post("/create-user", signup);
router.get("/get-all-users", getAllUsers)
router.post("/update-user", updateUser)

//! meh!
// router.get("/", authenticateToken, getUsers);
// router.get("/:id", getUserById);
// router.post("/", createUser);

export default router;
