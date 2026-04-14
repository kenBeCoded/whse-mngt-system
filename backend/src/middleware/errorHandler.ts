import { Request, Response, NextFunction } from "express";
import { ErrorCodes } from "../utils/apiResponse.js";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  console.error("Error:", error.message);
  console.error("Stack:", error.stack);

  res.status(500).json({
    success: false,
    error: {
      code: ErrorCodes.INTERNAL_ERROR,
      message:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : error.message,
      details:
        process.env.NODE_ENV === "development" ? { stack: error.stack } : null,
    },
  });
};
