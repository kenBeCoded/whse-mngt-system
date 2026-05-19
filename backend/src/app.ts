import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { logger } from "./middleware/logger.js";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { authenticateToken } from "./middleware/authToken.js";

const app = express();

app.set("trust proxy", 1);

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Custom middleware
// logger
app.use(logger);
// auth middleware
app.use(authenticateToken);

// Rate limiting
const isDev = process.env.NODE_ENV === "development";

if (isDev) {
  app.use("/api", routes);
} else {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // limit each IP to 300 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
  });
  app.use("/api", limiter, routes);
}

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
