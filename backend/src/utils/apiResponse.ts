import { Response } from "express";

// ─── Standard Response Types ─────────────────────────────────────────────────

export interface ApiSuccessResponse<T = any> {
  success: true;
  message?: string;
  data?: T;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: any;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorDetail;
}

// ─── Error Codes ─────────────────────────────────────────────────────────────

export const ErrorCodes = {
  // Auth
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  TOKEN_REQUIRED: "TOKEN_REQUIRED",
  TOKEN_INVALID: "TOKEN_INVALID",
  REFRESH_TOKEN_REQUIRED: "REFRESH_TOKEN_REQUIRED",
  REFRESH_TOKEN_INVALID: "REFRESH_TOKEN_INVALID",

  // User
  USER_NOT_FOUND: "USER_NOT_FOUND",
  USER_ALREADY_EXISTS: "USER_ALREADY_EXISTS",

  // Generic CRUD
  NOT_FOUND: "NOT_FOUND",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  BAD_REQUEST: "BAD_REQUEST",

  // Server
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

// ─── Response Helpers ────────────────────────────────────────────────────────

export const sendSuccess = <T = any>(
  res: Response,
  statusCode: number,
  data?: T,
  message?: string,
): void => {
  const response: ApiSuccessResponse<T> = {
    success: true,
    ...(message && { message }),
    ...(data !== undefined && { data }),
  };
  res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  statusCode: number,
  code: ErrorCode,
  message: string,
  details?: any,
): void => {
  const response: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      details: details ?? null,
    },
  };
  res.status(statusCode).json(response);
};
