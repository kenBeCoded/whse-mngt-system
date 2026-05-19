import { createContext } from "react";

export interface User {
  id: string;
  username: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  user_profile_image_url: string;
  email: string;
}

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);