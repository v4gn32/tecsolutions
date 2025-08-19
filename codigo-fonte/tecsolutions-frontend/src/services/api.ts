// FRONTEND: axios pré-configurado com baseURL e interceptors
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // base da API
  timeout: 20000, // timeout padrão
});

// Anexa token antes de cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ts_token"); // lê token salvo
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`; // envia JWT no header
  }
  return config;
});

// Trata erros globais (401, 403, etc.)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Exemplo: se não autorizado, limpa token e opcionalmente redireciona
    if (err?.response?.status === 401) {
      localStorage.removeItem("ts_token");
    }
    return Promise.reject(err);
  }
);
