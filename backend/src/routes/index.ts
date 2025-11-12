import { Router } from "express";
import express from "express";
import userRoutes from "./sub-routes/users.js";
import attendanceRoute from "./sub-routes/attendance.js";
import authController from "../auth/authController.js";
import { authenticateToken } from "../middleware/authToken.js";
const app = express();

const router = Router();
// app.use(authenticateToken);

router.use("/users", userRoutes);
router.use("/attendance", attendanceRoute);
router.use("/auth", authController);

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
