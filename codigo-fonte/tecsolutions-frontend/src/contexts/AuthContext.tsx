// src/contexts/AuthContext.tsx
// 👉 Contexto de autenticação: login, logout e perfil.
//    Normaliza role para MAIÚSCULAS e expõe "loading" para UI.

import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";
import type { User } from "../types/auth";

type AuthCtx = {
  user: User | null;
  loading: boolean;
  login: (p: { email: string; password: string }) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx>({} as AuthCtx);

const normRole = (r?: string) =>
  (r || "").toString().toUpperCase() === "ADMIN" ? "ADMIN" : "USER";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔁 Restaura sessão ao abrir a aplicação
  useEffect(() => {
    const boot = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const { data } = await api.get("/profile"); // {id,name,email,role}
        setUser({ ...data, role: normRole(data.role) });
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, []);

  // 🔐 Login
  const login: AuthCtx["login"] = async (p) => {
    try {
      const { data } = await api.post("/login", p); // retorna { token }
      localStorage.setItem("token", data.token);
      const { data: profile } = await api.get("/profile");
      setUser({ ...profile, role: normRole(profile.role) });
      return true;
    } catch {
      setUser(null);
      return false;
    }
  };

  // 🚪 Logout
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
