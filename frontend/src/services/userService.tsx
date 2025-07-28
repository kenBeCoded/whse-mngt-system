import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000", // replace with your API
  withCredentials: true, // to send cookies (refresh token)
});

export const authService = {
  login: async (username: string, password: string) => {
    const response = await API.post("/api/auth/login", {
      username,
      password,
    });
    return response.data; // { accessToken }
  },

  logout: async () => {
    await API.post("/api/auth/logout");
  },

  refresh: async () => {
    const response = await API.post("/api/auth/refresh");
    return response.data; // expected to return { accessToken }
  },

  getProfile: async (token: string) => {
    const response = await API.get("/api/auth/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
