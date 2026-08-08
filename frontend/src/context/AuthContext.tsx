import { createContext } from "react";

export interface User {
  id: string;
  username: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  user_profile_image_url: string;
  email: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  gender?: string;
  user_account_id?: string;
  u_sched_in?: string;
  u_sched_out?: string;
}

export interface AuthContextType {
  user: User | null;
  isInitializing: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);