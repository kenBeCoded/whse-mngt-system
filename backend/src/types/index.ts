import { Request } from 'express';

export interface User {
  id: number;
  username: string;
  password: string;
  created_at: Date;
  updated_at: Date;
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