// src/contexts/AuthContext.tsx
// ✅ Contexto de autenticação robusto com tratamento de erros e sessão persistida

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import { User, AuthState, LoginCredentials } from "../types/auth";

// 🔗 Funções reais do backend (utils/auth deve salvar/ler token)
import {
  login as apiLogin, // POST /auth/login -> { token, user }
  logout as apiLogout, // Limpa token local
  getProfile, // GET /auth/me ou /auth/profile -> user
  isAuthenticated as hasToken, // Verifica se há token salvo
} from "../utils/auth";

interface AuthContextType extends AuthState {
  // 🔐 Ações disponíveis no app
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  loading: boolean; // indica bootstrap / chamadas em progresso
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 📦 Hook de consumo
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // 🧠 Estado central
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });
  const [loading, setLoading] = useState<boolean>(true); // controla tela em branco
  const mounted = useRef(true); // evita setState após unmount

  useEffect(() => {
    // 🔄 Bootstrap: restaura sessão se houver token
    const bootstrap = async () => {
      try {
        if (!hasToken()) {
          setAuthState({ user: null, isAuthenticated: false });
          return;
        }
        const user = await getProfile(); // tenta validar token
        if (user) {
          setAuthState({ user, isAuthenticated: true });
        } else {
          // Token inválido/expirado → força logout
          apiLogout();
          setAuthState({ user: null, isAuthenticated: false });
        }
      } catch {
        // Qualquer erro de rede/parse → limpa sessão para não travar a UI
        apiLogout();
        setAuthState({ user: null, isAuthenticated: false });
      } finally {
        if (mounted.current) setLoading(false);
      }
    };

    bootstrap();
    return () => {
      mounted.current = false;
    };
  }, []);

  // 🔑 Executa login no backend e atualiza o estado
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setLoading(true);
    try {
      // apiLogin deve salvar o token internamente (utils/auth)
      const data = await apiLogin(credentials); // { token, user? }
      // 🔁 Garante dados atualizados do perfil
      const profile: User = (await getProfile()) || data?.user;
      if (!profile) throw new Error("Perfil não encontrado após login");

      setAuthState({ user: profile, isAuthenticated: true });
      return true;
    } catch {
      // Falha no login → zera sessão
      apiLogout();
      setAuthState({ user: null, isAuthenticated: false });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 🚪 Limpa token e estado
  const logout = () => {
    apiLogout();
    setAuthState({ user: null, isAuthenticated: false });
  };

  // 🧩 Evita recriar objeto do contexto a cada render
  const value = useMemo(
    () => ({ ...authState, login, logout, loading }),
    [authState, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
