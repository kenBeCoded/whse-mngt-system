import { Request } from "express";

export interface User {
  id: number;
  user_account_id: number;
  username: string;
  password_hash: string;
  email?: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  gender: string;
  user_profile_image_url?: string;
  created_at: Date;
  updated_at: Date;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    username: string;
  };
}

export interface JWTPayload {
  userId: number;
  username: string;
  iat?: number;
  exp?: number;
}
