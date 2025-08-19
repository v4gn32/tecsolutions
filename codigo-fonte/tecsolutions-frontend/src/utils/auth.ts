// src/utils/auth.ts
// 🔐 Camada de autenticação + utilidades de usuário (admin)
// Mantém compatibilidade com o AuthContext e adiciona getUsers/saveUser/deleteUser.

// ⬇️ Importa o client HTTP e tipos
import { api } from "../services/api";
import { User, LoginCredentials } from "../types/auth";

const TOKEN_KEY = "ts_token"; // chave do token no localStorage

// ⚙️ Aplica o token atual (se existir) no header Authorization do axios
function applyTokenToApi() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

/* --------------------------------- AUTENTICAÇÃO --------------------------------- */

// ▶️ Inicializa auth (ex.: ao carregar o app) — aplica o token salvo no header
export function initializeAuth() {
  applyTokenToApi();
}

// 🚪 Logout: remove token e limpa o header Authorization
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  applyTokenToApi();
}

// ▶️ Login real: POST /auth/login -> salva token -> GET /auth/profile
export async function login(
  credentials: LoginCredentials
): Promise<User | null> {
  // 🔸 Envia credenciais para o backend
  const { data } = await api.post("/auth/login", credentials); // { token }
  // 🔸 Persiste token e configura header
  localStorage.setItem(TOKEN_KEY, data.token);
  applyTokenToApi();
  // 🔸 Busca dados do usuário logado
  const me = await getCurrentUser();
  return me;
}

// 👤 Perfil atual: GET /auth/profile (se token válido); senão retorna null
export async function getCurrentUser(): Promise<User | null> {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  try {
    const { data } = await api.get("/auth/profile");
    const user: User = {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role, // 'admin' | 'tecnico' | 'user'
    };
    return user;
  } catch {
    // 🔸 Token inválido/expirado: limpa token e header
    localStorage.removeItem(TOKEN_KEY);
    applyTokenToApi();
    return null;
  }
}

/* --------------------------------- USUÁRIOS (ADMIN) --------------------------------- */
// Obs.: Ajuste os tipos conforme seu backend. Abaixo usamos tipos genéricos mínimos.

// Tipo mínimo para criação/edição de usuário (ajuste se necessário)
export type UpsertUserDTO = {
  id?: string; // se existir, edita; se não, cria
  name: string;
  email: string;
  password?: string; // opcional para edição
  role?: "admin" | "tecnico" | "user";
};

// 📄 Lista de usuários (GET /users)
export async function getUsers(params?: Record<string, any>): Promise<User[]> {
  // 💡 params permite filtros (ex.: ?search=...&role=...)
  const { data } = await api.get("/users", { params });
  return data;
}

// 💾 Cria ou atualiza um usuário (POST ou PUT)
export async function saveUser(payload: UpsertUserDTO): Promise<User> {
  if (payload.id) {
    // ✏️ Atualiza
    const { id, ...rest } = payload;
    const { data } = await api.put(`/users/${id}`, rest);
    return data;
  } else {
    // ➕ Cria
    const { data } = await api.post("/users", payload);
    return data;
  }
}

// 🗑️ Remove um usuário (DELETE /users/:id)
export async function deleteUser(id: string): Promise<{ success: boolean }> {
  await api.delete(`/users/${id}`);
  return { success: true };
}

/* --------------------------------- UTILIDADES --------------------------------- */

// 🔎 Retorna o token atual (caso precise em algum ponto específico)
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
