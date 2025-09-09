// src/components/ProtectedRoute.tsx
// Protege rotas privadas. Redireciona ao /login se não autenticado.

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

type Props = {
  children: JSX.Element;
  roles?: Array<"admin" | "user">; // Opcional: restringir por role
};

const ProtectedRoute: React.FC<Props> = ({ children, roles }) => {
  const { user, loading } = useAuth();

  // ⏳ Enquanto verifica token/perfil, não pisca a tela
  if (loading) {
    return <div className="w-full h-screen flex items-center justify-center">Carregando...</div>;
  }

  // 🔒 Não logado → login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🛂 Se roles foram definidas, verifica autorização
  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    // Sem permissão → poderia ir para 403 custom
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
