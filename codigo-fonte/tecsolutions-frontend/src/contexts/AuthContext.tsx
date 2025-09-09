// Contexto de autenticação com login/logout e getProfile
import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../utils/api";
import { setToken, clearToken, getToken } from "../utils/storage";
import type { User, AuthResponse } from "../types/auth";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (emailOrCpf: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({} as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Carrega perfil se tiver token
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const { data } = await api.get<User>("/auth/profile");
        setUser(data);
      } catch {
        clearToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(emailOrCpf: string, password: string) {
    // Chama backend: POST /auth/login  → { token, user }
    const { data } = await api.post<AuthResponse>("/auth/login", {
      identifier: emailOrCpf,
      password,
    });
    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    clearToken();
    setUser(null);
    // Redirecionamento simples:
    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
