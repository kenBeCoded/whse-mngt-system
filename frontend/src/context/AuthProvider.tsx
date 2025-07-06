// import React, {
//   createContext,
//   //   useContext,
//   useState,
//   useEffect,
//   type ReactNode,
//   useContext,
// } from "react";
// import { AxiosError } from "axios";
// import axios from "../api/axios";

// // Types
// interface User {
//   id: number;
//   username: string;
// }

// interface AuthContextType {
//   user: User | null;
//   accessToken: string | null;
//   login: (username: string, password: string) => Promise<void>;
//   logout: () => Promise<void>;
//   register: (username: string, password: string) => Promise<void>;
//   isLoading: boolean;
//   error: string | null;
//   clearError: () => void;
// }

// interface AuthProviderProps {
//   children: ReactNode;
// }

// // Create the context
// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // Custom hook to use the auth context
// export const useAuth = (): AuthContextType => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

// // Auth Provider Component
// export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [accessToken, setAccessToken] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // Clear error function
//   const clearError = () => setError(null);

//   // Login function
//   const login = async (username: string, password: string): Promise<void> => {
//     try {
//       setIsLoading(true);
//       setError(null);

//       const response = await axios.post(
//         "/api/auth/login",
//         { username, password },
//         { withCredentials: true }
//       );

//       const { accessToken: newAccessToken } = response.data;
//       console.log("[AuthProvider.tsx:68]", newAccessToken);
//       setAccessToken(newAccessToken);

//       // Decode the token to get user info (optional - you could also make a separate API call)
//       const payload = JSON.parse(atob(newAccessToken.split(".")[1]));
//       setUser({ id: payload.userId, username: payload.username });
//     } catch (err) {
//       const axiosError = err as AxiosError;
//       setError(axiosError.response?.data?.message || "Login failed");
//       throw err;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Register function
//   const register = async (
//     username: string,
//     password: string
//   ): Promise<void> => {
//     try {
//       setIsLoading(true);
//       setError(null);

//       await axios.post("/api/auth/register", { username, password });

//       // Automatically login after successful registration
//       await login(username, password);
//     } catch (err) {
//       const axiosError = err as AxiosError;
//       setError(axiosError.response?.data?.message || "Registration failed");
//       throw err;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Logout function
//   const logout = async (): Promise<void> => {
//     try {
//       setIsLoading(true);
//       await axios.post("/api/logout", {}, { withCredentials: true });
//     } catch (err) {
//       console.error("Logout error:", err);
//     } finally {
//       setAccessToken(null);
//       setUser(null);
//       setError(null);
//       setIsLoading(false);
//     }
//   };

//   // Refresh token function
//   const refreshAccessToken = async (): Promise<string | null> => {
//     try {
//       const response = await axios.post(
//         "/api/auth/refresh",
//         {},
//         { withCredentials: true }
//       );
//       const { accessToken: newAccessToken } = response.data;

//       setAccessToken(newAccessToken);

//       // Update user info from token
//       const payload = JSON.parse(atob(newAccessToken.split(".")[1]));
//       setUser({ id: payload.userId, username: payload.username });

//       return newAccessToken;
//     } catch (err) {
//       console.error("Token refresh failed:", err);
//       setAccessToken(null);
//       setUser(null);
//       return null;
//     }
//   };

//   // Setup axios interceptors
//   useEffect(() => {
//     // Request interceptor to add token to headers
//     const requestInterceptor = axios.interceptors.request.use(
//       (config) => {
//         if (accessToken) {
//           config.headers["Authorization"] = `Bearer ${accessToken}`;
//         }
//         return config;
//       },
//       (error) => Promise.reject(error)
//     );

//     // Response interceptor to handle token expiry
//     const responseInterceptor = axios.interceptors.response.use(
//       (response) => response,
//       async (error) => {
//         const originalRequest = error.config;

//         if (error.response?.status === 403 && !originalRequest._retry) {
//           originalRequest._retry = true;

//           const newToken = await refreshAccessToken();

//           if (newToken) {
//             originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
//             return axios(originalRequest);
//           }
//         }

//         return Promise.reject(error);
//       }
//     );

//     // Cleanup interceptors on unmount
//     return () => {
//       axios.interceptors.request.eject(requestInterceptor);
//       axios.interceptors.response.eject(responseInterceptor);
//     };
//   }, [accessToken]);

//   // Check for existing session on mount
//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         setIsLoading(true);
//         await refreshAccessToken();
//       } catch (err) {
//         console.error("Auth check failed:", err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     checkAuth();
//   }, []);

//   const value: AuthContextType = {
//     user,
//     accessToken,
//     login,
//     logout,
//     register,
//     isLoading,
//     error,
//     clearError,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

import { createContext, useState, useEffect, type ReactNode } from "react";
import { authService } from "../services/userService";

interface AuthContextType {
  user: any;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const login = async (email: string, password: string) => {
    const { accessToken } = await authService.login(email, password);
    setAccessToken(accessToken);
    const profile = await authService.getProfile(accessToken);
    setUser(profile);
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
    } catch {
      logout();
    }
  };

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
    <AuthContext.Provider value={{ user, accessToken, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
