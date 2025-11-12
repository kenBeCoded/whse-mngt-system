//? /api/users
import { Router } from "express";

import {
  createUser,
  getAllUsers,
  updateUser,
  deleteUser,
  getUserByUsername,
} from "../../controllers/users/usersController.js";

const router = Router();

router.post("/create-user", createUser);
router.get("/get-all-users", getAllUsers);
router.post("/get-user-by-username", getUserByUsername);
router.patch("/update-user", updateUser);
router.delete("/delete-user", deleteUser);

export default router;
