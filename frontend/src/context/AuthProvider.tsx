import { createContext, useState, useEffect, type ReactNode } from "react";
import { authService } from "../services/userService";
import type { AxiosError } from "axios";
interface User {
  id: number;
  username: string;
}
interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

interface ErrorResponse {
  message: string;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    try {
      const { accessToken } = await authService.login(email, password);
      setAccessToken(accessToken);
      const profile = await authService.getProfile(accessToken);
      setUser(profile);
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      // const errorMessage = err.response?.data?.message || "Login failed";
      setError(axiosError.response?.data?.message || "Login failed");
      throw err;
    }
  };

  const logout = async () => {
    await authService.logout();
    setAccessToken(null);
    setUser(null);
  };

  const refreshAccessToken = async () => {
    try {
      const { accessToken } = await authService.refresh();
      setAccessToken(accessToken);
      const profile = await authService.getProfile(accessToken);
      setUser(profile);
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      console.log(axiosError.response?.data?.message || "Token refresh failed");
      // const errorMessage = err.response?.data?.message || "Token refresh failed";
      // setError(axiosError.response?.data?.message || "Token refresh failed"); // Assuming error state is used
      logout();
    }
  };

  const clearError = () => setError(null);

  useEffect(() => {
    const init = async () => {
      try {
        await refreshAccessToken();
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, accessToken, login, logout, loading, error, clearError }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
