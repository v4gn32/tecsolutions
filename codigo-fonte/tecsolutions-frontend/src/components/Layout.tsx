// src/components/institutional/Layout.tsx
// Mantém o layout; corrige redirect de auth e título da página.

import React from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import {
  Home,
  Users,
  Settings,
  FileText,
  PlusCircle,
  BarChart3,
  Package,
  LogOut,
  UserCog,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { isAuthenticated as hasToken } from "../utils/auth";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  // 1) Se não autenticado e sem token → redireciona pro login
  if (!isAuthenticated && !hasToken()) {
    return <Navigate to="/login" replace />;
  }

  // 2) Se tem token mas user ainda não carregou → fallback leve
  if (hasToken() && !user && !isAuthenticated) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <span className="text-sm opacity-70">Carregando…</span>
      </div>
    );
  }

  const menuItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/proposals", icon: FileText, label: "Propostas" },
    { path: "/proposals/new", icon: PlusCircle, label: "Nova Proposta" },
    { path: "/clients", icon: Users, label: "Clientes" },
    { path: "/services", icon: Settings, label: "Serviços" },
    { path: "/products", icon: Package, label: "Produtos" },
    { path: "/reports", icon: BarChart3, label: "Relatórios" },
  ];

  // 3) Item admin
  if (user?.role === "admin") {
    menuItems.push({ path: "/admin/users", icon: UserCog, label: "Usuários" });
  }

  // 4) Logout
  const handleLogout = () => {
    logout();
  };

  // 5) Título da página (corrige '/' como Dashboard)
  const currentTitle =
    location.pathname === "/"
      ? "Dashboard"
      : menuItems.find((item) => item.path === location.pathname)?.label ||
        "Sistema";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg relative">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold" style={{ color: "#0D1F42" }}>
            TecSolutions
          </h1>
          <p className="text-sm text-gray-600 mt-1">Sistema de Propostas</p>
        </div>

        <nav className="mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "bg-cyan-50 text-cyan-600 border-r-2 border-cyan-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Info and Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
          <div className="flex items-center mb-4">
            <div className="bg-tecsolutions-primary rounded-full w-10 h-10 flex items-center justify-center mr-3">
              <span className="text-white font-medium text-sm">
                {/* Comentário: inicial do nome com fallback */}
                {(user?.name?.[0] || "U").toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || "Usuário"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.role === "admin" ? "Administrador" : "Usuário"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors duration-200"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sair
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">
                {currentTitle}
              </h2>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  {new Date().toLocaleDateString("pt-BR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div className="text-sm text-gray-600">
                  Bem-vindo, {user?.name || "Usuário"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
