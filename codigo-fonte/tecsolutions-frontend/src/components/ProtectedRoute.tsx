// src/components/ProtectedRoute.tsx
// Protege rotas e evita redirect antes de carregar o perfil do usuário.

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { isAuthenticated as hasToken } from "../utils/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  adminOnly = false,
}) => {
  const { isAuthenticated, user } = useAuth();

  // Comentário: Se existe token salvo mas o user ainda não carregou,
  // mostramos um fallback simples para evitar redirecionar antes da hora.
  const hasSavedToken = hasToken();
  if (hasSavedToken && !user && !isAuthenticated) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        {/* Comentário: placeholder leve (sem alterar layout global) */}
        <span className="text-sm opacity-70">Carregando…</span>
      </div>
    );
  }

  // Comentário: Sem token e não autenticado → envia para login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Comentário: Rota apenas para admin → se não for admin, manda para dashboard
  if (adminOnly && user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // Comentário: Autorizado → renderiza o conteúdo protegido
  return <>{children}</>;
};

export default ProtectedRoute;
