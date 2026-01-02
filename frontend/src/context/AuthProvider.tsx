import { useState, useEffect, useRef, type ReactNode } from "react";
import { authService } from "../services/userService";
import { setAuthToken } from "../api/axios";
import type { AxiosError } from "axios";
import { AuthContext, type User } from "./AuthContext";

interface ErrorResponse {
  message: string;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Use ref to store the refresh timer ID
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const login = async (email: string, password: string) => {
    try {
      const { accessToken } = await authService.login(email, password);
      setAccessToken(accessToken);
      setAuthToken(accessToken ?? null);
      const profile = await authService.getProfile(accessToken);
      setUser(profile);

      // Start the token refresh timer after successful login
      scheduleTokenRefresh();
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      setError(axiosError.response?.data?.message || "Login failed");
      throw err;
    }
  };

  const logout = async () => {
    // Clear the refresh timer on logout
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

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

      // Schedule the next refresh after successfully refreshing
      scheduleTokenRefresh();
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      console.log(axiosError.response?.data?.message || "Token refresh failed");
      logout();
    }
  };

  // Schedule token refresh to occur before expiration
  const scheduleTokenRefresh = () => {
    // Clear any existing timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    // Token expires in 15 minutes (900000ms)
    // Refresh 1 minute before expiration (840000ms = 14 minutes)
    const REFRESH_TIME = 14 * 60 * 1000; // 14 minutes in milliseconds

    refreshTimerRef.current = setTimeout(() => {
      refreshAccessToken();
    }, REFRESH_TIME);
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

    // Cleanup function to clear timer when component unmounts
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, accessToken, login, logout, loading, error, clearError }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
