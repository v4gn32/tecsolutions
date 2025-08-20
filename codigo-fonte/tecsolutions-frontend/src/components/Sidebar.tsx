// src/components/Sidebar.tsx
// 👉 Menu lateral. Mostra item "Usuários" somente para ADMIN.

import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Sidebar() {
  const { user, loading } = useAuth();
  if (loading) return null;

  const isAdmin = user?.role === "ADMIN";

  const item = (to: string, label: string) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block px-4 py-2 rounded-md ${
          isActive ? "bg-gray-100 font-medium" : "hover:bg-gray-50"
        }`
      }
    >
      {label}
    </NavLink>
  );

  return (
    <aside className="w-64 border-r bg-white">
      <div className="p-4 text-xl font-bold">TecSolutions</div>
      <nav className="space-y-1 px-2">
        {item("/dashboard", "Dashboard")}
        {item("/proposals", "Propostas")}
        {item("/new-proposal", "Nova Proposta")}
        {item("/clients", "Clientes")}
        {item("/services", "Serviços")}
        {item("/products", "Produtos")}
        {item("/reports", "Relatórios")}
        {isAdmin && item("/admin/users", "Usuários")}
        {/* 🔒 só ADMIN */}
      </nav>

      {/* rodapé do usuário logado */}
      <div className="mt-auto p-4 text-sm text-gray-600">
        <div className="font-medium">{user?.name || "—"}</div>
        <div className="text-xs">{isAdmin ? "Administrador" : "Usuário"}</div>
      </div>
    </aside>
  );
}
