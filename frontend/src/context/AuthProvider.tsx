import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
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
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Use ref to store the refresh timer ID
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Track whether the user had an authenticated session — prevents calling /logout
  // when there was never a valid session (e.g. navigating to /login cold).
  const wasAuthenticatedRef = useRef<boolean>(false);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { accessToken } = await authService.login(email, password);
      setAccessToken(accessToken);
      setAuthToken(accessToken ?? null);
      const profile = await authService.getProfile(accessToken);
      setUser(profile);
      wasAuthenticatedRef.current = true;
      // Mark that a valid session exists so future page loads (and new tabs) attempt a refresh
      localStorage.setItem("had_session", "true");

      // Start the token refresh timer after successful login
      scheduleTokenRefresh();
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
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    wasAuthenticatedRef.current = false;
    // Remove the session flag so the next cold load skips the refresh call
    localStorage.removeItem("had_session");
    setAccessToken(null);
    setAuthToken(null);
    setUser(null);
  }, []);

  const logout = async () => {
    // Clear the refresh timer on logout
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    wasAuthenticatedRef.current = false;
    // Clear the session flag so the login page loads instantly after logout
    localStorage.removeItem("had_session");

    // Only hit the server if there was an authenticated session to invalidate
    await authService.logout();
    setAccessToken(null);
    setAuthToken(null);
    setUser(null);
  };

  const refreshAccessToken = useCallback(async () => {
    try {
      const { accessToken } = await authService.refresh();
      setAccessToken(accessToken);
      setAuthToken(accessToken ?? null);
      const profile = await authService.getProfile(accessToken);
      setUser(profile);
      wasAuthenticatedRef.current = true;
      // Keep the session flag alive for the duration of the session
      localStorage.setItem("had_session", "true");

      // Schedule the next refresh after successfully refreshing
      scheduleTokenRefresh();
    } catch (err) {
      // If the user had an active session, call the server logout to clear cookies.
      // If there was never a session (e.g. first visit / cold load to /login),
      // just silently clear local state — no server round-trip needed.
      if (wasAuthenticatedRef.current) {
        await authService.logout();
      }
      clearAuthState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearAuthState]);

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
      // Only attempt a refresh if there was a prior authenticated session.
      // On a cold load (e.g. visiting /login for the first time), skip the
      // network call entirely so the page renders instantly.
      const hadSession = localStorage.getItem("had_session") === "true";
      if (!hadSession) {
        setIsInitializing(false);
        return;
      }

      // refreshAccessToken handles its own errors internally (clearAuthState),
      // so we just need to ensure isInitializing is cleared when done.
      await refreshAccessToken().finally(() => setIsInitializing(false));
    };
    init();

    // Cleanup function to clear timer when component unmounts
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
    // refreshAccessToken is stable (useCallback with no changing deps)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshAccessToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isInitializing,
        login,
        logout,
        loading,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
