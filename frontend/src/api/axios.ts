import axios, { type AxiosInstance } from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// In-memory token used by request interceptor. Updated by setAuthToken.
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true, // send cookies by default (useful for refresh)
});

// Attach Authorization header if token is available
axiosInstance.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers = config.headers || {};
      // Only set header if not already provided
      if (!("Authorization" in config.headers)) {
        config.headers["Authorization"] = `Bearer ${authToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
