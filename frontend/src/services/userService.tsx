// import axios from "axios";
import axios from "../api/axios";

const API = axios; // use shared configured axios instance (baseURL + withCredentials + auth interceptor)

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
