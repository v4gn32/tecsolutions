// src/utils/api.ts
// Cliente Axios centralizado com injeção do JWT e tratamento de 401

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // http://localhost:3000/api
  timeout: 15000,
});

// 🔐 Anexa o token a cada requisição, se existir
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ts_token"); // chave única do projeto
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🚨 Intercepta 401 para padronizar tratamento no app
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // Opcional: você pode emitir um evento/global ou só repassar o erro
      // Aqui apenas retornaremos a rejeição para o AuthContext tratar
    }
    return Promise.reject(err);
  }
);

export default api;
