// Tipos de autenticação

// Função: papéis permitidos
export type UserRole = "admin" | "user";

// Função: modelo de usuário recebido do backend
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string; // ISO string vindo da API
  createdBy?: string;
}

// Função: estado de auth no front
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// Função: credenciais de login (envio)
export interface LoginCredentials {
  email: string;
  password: string;
}

// Função: resposta de login do backend
export interface LoginResponse {
  user: User;
  token: string; // JWT/Bearer vindo da API
}

// Função: resposta de "me"
export interface CurrentUserResponse {
  user: User;
}

// Função: erro padrão da API
export interface ApiError {
  status: number;
  message: string;
  details?: unknown;
}
