// Axios pré-configurado com baseURL e interceptors de auth
import axios from "axios";
import { getToken } from "./storage";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // http://localhost:3000/api
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
