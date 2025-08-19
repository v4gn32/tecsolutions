// types/auth.ts
export type Role = "admin" | "tecnico" | "user";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
};

export type LoginCredentials = {
  email: string;
  password: string;
};
