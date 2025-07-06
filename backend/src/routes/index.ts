import { Router } from "express";
import userRoutes from "./sub-routes/users.js";
import authController from "../auth/authController.js"

const router = Router();

router.use("/users", userRoutes);
router.use("/auth", authController)

// API info route
router.get("/", (req, res) => {
  res.json({
    message: "API is running!",
    version: "1.0.0",
    endpoints: {
      users: "/api/users",
      health: "/health",
    },
  });
});

export default router;