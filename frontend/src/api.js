import axios from "axios";

const base = import.meta.env.VITE_API_URL?.replace(/\/$/, "");
const api = axios.create({
  baseURL: `${base}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
