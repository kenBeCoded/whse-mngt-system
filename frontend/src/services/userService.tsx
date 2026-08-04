import axios from "../api/axios";

const API = axios; // shared axios instance (withCredentials: true — cookie sent automatically)

export const authService = {
  login: async (username: string, password: string) => {
    const response = await API.post(
      "/api/auth/login",
      { username, password },
      { timeout: 10000 }
    );
    // Backend returns { success, data: { user: { id, username, role } } }
    // The accessToken is set as an HTTP-only cookie by the server — not in the body
    return response.data.data as {
      user: { id: number; username: string; role: string };
    };
  },

  logout: async () => {
    await API.post("/api/auth/logout");
  },

  getProfile: async () => {
    const response = await API.get("/api/auth/profile", { timeout: 10000 });
    // Backend returns { success, data: { id, username, role, ... } }
    return response.data.data;
  },
};
