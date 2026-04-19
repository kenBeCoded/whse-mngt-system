// import axios from "axios";
import axios from "../api/axios";

const API = axios; // use shared configured axios instance (baseURL + withCredentials + auth interceptor)

export const authService = {
  login: async (username: string, password: string) => {
    const response = await API.post("/api/auth/login", {
      username,
      password,
    });
    // Backend wraps payload in { success, data: { accessToken, user } }
    return response.data.data as { accessToken: string; user: { id: number; username: string; role: string } };
  },

  logout: async () => {
    await API.post("/api/auth/logout");
  },

  refresh: async () => {
    const response = await API.post("/api/auth/refresh");
    // Backend wraps payload in { success, data: { accessToken } }
    return response.data.data as { accessToken: string };
  },

  getProfile: async (token: string) => {
    const response = await API.get("/api/auth/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Backend wraps payload in { success, data: { id, username, role, ... } }
    return response.data.data;
  },
};
