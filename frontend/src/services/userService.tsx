// import axios from "axios";

// export const userService = {
//   getProfile: () => axios.get("/api/user/profile"),
//   updateProfile: (data: any) => axios.put("/api/user/profile", data),
//   deleteAccount: () => axios.delete("/api/user/account"),
// };

// export const dataService = {
//   getData: () => axios.get("/api/data"),
//   createData: (data: any) => axios.post("/api/data", data),
//   updateData: (id: number, data: any) => axios.put(`/api/data/${id}`, data),
//   deleteData: (id: number) => axios.delete(`/api/data/${id}`),
// };

import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000", // replace with your API
  withCredentials: true, // to send cookies (refresh token)
});

export const authService = {
  login: async (username: string, password: string) => {
    const response = await API.post("/api/auth/login", { username, password });
    return response.data; // expected to return { accessToken }
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
