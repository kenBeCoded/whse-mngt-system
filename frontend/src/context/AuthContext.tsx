import { createContext } from "react";

interface User {
  id: number;
  username: string;
  role: string;
  updatedAt: string;
  createdAt: string;
  user_profile_image_url: string;
  email?: string;
}

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);