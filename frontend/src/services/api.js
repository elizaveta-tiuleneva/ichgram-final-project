import axios from "axios";
import { getActiveToken } from "../utils/accountStorage.js";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getActiveToken() || localStorage.getItem("token");

  const isAuthRequest =
    config.url === "/auth/login" ||
    config.url === "/auth/register";

  if (token && !isAuthRequest) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;