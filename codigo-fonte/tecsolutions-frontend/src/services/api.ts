// Cliente HTTP central com baseURL do .env e token via header
import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL; // ex.: http://localhost:3000/api
export const api = axios.create({ baseURL });

// ➕ injeta token do localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Tratamento simples de 401/403
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const s = err?.response?.status;
    if (s === 401) window.location.href = "/login";
    if (s === 403) alert("Acesso negado.");
    return Promise.reject(err);
  }
);
