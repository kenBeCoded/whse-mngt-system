import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { authService } from "../services/userService";
import type { AxiosError } from "axios";
import { AuthContext, type User } from "./AuthContext";

interface ErrorResponse {
  message: string;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Track whether the user had an authenticated session to avoid unnecessary
  // /profile calls on first cold load to /login
  const wasAuthenticatedRef = useRef<boolean>(false);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      // Server sets an HTTP-only accessToken cookie on success
      await authService.login(username, password);
      // Fetch the profile now that the cookie is set
      const profile = await authService.getProfile();
      setUser(profile);
      wasAuthenticatedRef.current = true;
      // Mark session so we attempt profile fetch on future page loads
      localStorage.setItem("had_session", "true");
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      setError(axiosError.response?.data?.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /** Clears local auth state WITHOUT calling the server logout endpoint. */
  const clearAuthState = useCallback(() => {
    wasAuthenticatedRef.current = false;
    localStorage.removeItem("had_session");
    setUser(null);
  }, []);

  const logout = async () => {
    wasAuthenticatedRef.current = false;
    localStorage.removeItem("had_session");
    // Server clears the accessToken cookie
    await authService.logout();
    setUser(null);
  };

  // On app startup, if the user had a prior session, try to restore it by
  // fetching the profile (the HTTP-only cookie is sent automatically).
  useEffect(() => {
    const init = async () => {
      const hadSession = localStorage.getItem("had_session") === "true";
      if (!hadSession) {
        setIsInitializing(false);
        return;
      }

      try {
        const profile = await authService.getProfile();
        setUser(profile);
        wasAuthenticatedRef.current = true;
      } catch {
        // Cookie is expired or invalid — clear local session marker
        clearAuthState();
      } finally {
        setIsInitializing(false);
      }
    };

    init();
  }, [clearAuthState]);

  const clearError = () => setError(null);

  const refreshProfile = async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
    } catch {
      // silently fail
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isInitializing,
        login,
        logout,
        loading,
        error,
        clearError,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
