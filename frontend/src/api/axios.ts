import axios, { type AxiosInstance } from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true, // always send the HTTP-only accessToken cookie
});

export default axiosInstance;
