import { useState, useEffect, type ReactNode } from "react";
import { authService } from "../services/userService";
import { setAuthToken } from "../api/axios";
import type { AxiosError } from "axios";
import { AuthContext } from "./AuthContext";



interface User {
  id: number;
  username: string;
  role: string;
  updatedAt: string;
  createdAt: string;
  user_profile_image_url: string;
  email?: string;
}

interface ErrorResponse {
  message: string;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    try {
      const { accessToken } = await authService.login(email, password);
      setAccessToken(accessToken);
      // Update axios instance so stores/services use the latest token
      setAuthToken(accessToken ?? null);
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
    setAuthToken(null);
    setUser(null);
  };

  const refreshAccessToken = async () => {
    try {
      const { accessToken } = await authService.refresh();
      setAccessToken(accessToken);
      setAuthToken(accessToken ?? null);
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