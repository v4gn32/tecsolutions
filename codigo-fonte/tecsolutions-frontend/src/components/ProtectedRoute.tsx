// src/components/ProtectedRoute.tsx
// 👉 Protege rotas e (opcional) exige papel específico.

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({
  children,
  requireRole,
}: {
  children: React.ReactNode;
  requireRole?: "ADMIN" | "USER";
}) {
  const { user, loading } = useAuth();

  if (loading) return null; // evita flicker enquanto carrega perfil
  if (!user) return <Navigate to="/login" replace />;

  const ok = !requireRole || user.role === requireRole;
  return ok ? <>{children}</> : <Navigate to="/dashboard" replace />;
}
