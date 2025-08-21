// src/utils/auth.ts
// Comentário: util de autenticação + CRUD de usuários via backend

import type { User, LoginCredentials, LoginResponse } from "../types/auth";

// 🔧 Constantes (uma vez só)
const API = import.meta.env.VITE_API_URL ?? "";
const AUTH_STORAGE_KEY = "tecsolutions_auth";
const TOKEN_STORAGE_KEY = "tecsolutions_token";

// 🔧 Helpers de token
const getToken = () => localStorage.getItem(TOKEN_STORAGE_KEY);
const setToken = (t: string) => localStorage.setItem(TOKEN_STORAGE_KEY, t);
const removeToken = () => localStorage.removeItem(TOKEN_STORAGE_KEY);

// 🔧 Headers autenticados (FALTAVA)
const authHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ================= AUTH =================

// Login -> salva token + user
export async function login(
  credentials: LoginCredentials
): Promise<User | null> {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) return null;

  const data: LoginResponse = await res.json();
  setToken(data.token);
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user));
  return data.user;
}

// Logout: apenas limpa token+user
export function logout() {
  removeToken();
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

// Perfil do usuário autenticado
export async function getProfile(): Promise<User | null> {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`${API}/auth/me`, { headers: authHeaders() }); // <-- /auth/me
  if (res.status === 401) {
    logout();
    return null;
  }
  if (!res.ok) throw new Error("Falha ao obter perfil");
  const { user } = (await res.json()) as { user: User };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  return user;
}

// ================= USERS (Admin) =================

// Lista usuários
export const getUsers = async (): Promise<User[]> => {
  const res = await fetch(`${API}/users`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Falha ao carregar usuários");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
};

// Cria/atualiza usuário (POST se novo, PUT se tiver id)
export const saveUser = async (
  user: Partial<User> & { password?: string }
): Promise<User> => {
  const hasId = Boolean(user.id);
  const url = hasId ? `${API}/users/${user.id}` : `${API}/users`;
  const method = hasId ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    headers: authHeaders(),
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error("Falha ao salvar usuário");
  return res.json();
};

// ❗️EXPORT QUE ESTAVA FALTANDO
export const deleteUser = async (id: string): Promise<boolean> => {
  const res = await fetch(`${API}/users/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Falha ao excluir usuário");
  return true;
};

// ================= Helpers de estado =================
export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(AUTH_STORAGE_KEY);
  return data ? (JSON.parse(data) as User) : null;
};

export const isAuthenticated = (): boolean => !!getToken();
export const isAdmin = (): boolean => getCurrentUser()?.role === "admin";

// initializeAuth agora é no-op (backend cuida)
export const initializeAuth = (): void => {};

// ⬇️ adicione/garanta isto (exportado)
export const getAuthHeaders = () => {
  const token = localStorage.getItem("tecsolutions_token"); // Comentário: lê token salvo
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};
