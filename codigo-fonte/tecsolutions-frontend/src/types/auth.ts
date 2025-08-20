// src/types/auth.ts
// 👉 Tipos globais do usuário (ROLE sempre em MAIÚSCULAS)
export type Role = "ADMIN" | "USER";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role; // <- padrão único
  createdAt?: string | Date;
  createdBy?: string;
};
