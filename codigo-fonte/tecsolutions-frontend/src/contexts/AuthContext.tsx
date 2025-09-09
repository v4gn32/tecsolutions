// src/contexts/AuthContext.tsx
// Contexto de autenticação: login, logout, perfil e proteção de rotas (MVC: camada de "View-Model")
// Mantém o usuário em estado global e integra com a API (camada "Controller/Service" está no backend)

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import api from "../utils/api";

// -----------------------------
// Tipos do usuário e do contexto
// -----------------------------
export type Role = "admin" | "user";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);

// -----------------------------
// Provider
// -----------------------------
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔁 Carrega o token se existir e tenta obter o perfil ao iniciar
  useEffect(() => {
    const token = localStorage.getItem("ts_token");
    if (!token) {
      setLoading(false); // Sem token, permanece deslogado
      return;
    }

    (async () => {
      try {
        // GET /api/auth/profile → { id, name, email, role }
        const { data } = await api.get<AuthUser>("/auth/profile");
        setUser(data);
      } catch (err) {
        // 401/erro: token inválido/expirado -> limpar e seguir deslogado
        localStorage.removeItem("ts_token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 🔐 Login: salva token e carrega perfil
  // - Retorna true em sucesso
  // - Em falha, lança erro com a mensagem do backend (capturada no Login.tsx)
  const login = async (credentials: LoginCredentials) => {
    try {
      // POST /api/auth/login → { token, user? }
      const { data } = await api.post<{ token: string; user?: AuthUser }>(
        "/auth/login",
        {
          email: credentials.email,
          password: credentials.password,
        }
      );

      const token = data?.token;
      if (!token) {
        throw new Error("Resposta de login sem token.");
      }

      // 🔑 Guarda o token localmente
      localStorage.setItem("ts_token", token);

      // ♻️ Busca perfil atualizado (fonte de verdade)
      const profileRes = await api.get<AuthUser>("/auth/profile");
      setUser(profileRes.data);

      return true;
    } catch (err: any) {
      // Propaga a mensagem da API para o Login.tsx exibir
      const apiMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Não foi possível autenticar.";
      throw new Error(apiMessage);
    }
  };

  // 🚪 Logout: limpa token e usuário
  const logout = () => {
    localStorage.removeItem("ts_token");
    setUser(null);
  };

  // ♻️ Recarrega o perfil (útil após updates)
  const refreshProfile = async () => {
    const { data } = await api.get<AuthUser>("/auth/profile");
    setUser(data);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
