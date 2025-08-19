// src/App.tsx
// 🚀 App principal SEM mocks/localStorage, com rotas públicas e protegidas

import React, { PropsWithChildren } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// 🔐 Contexto de autenticação real (usa backend)
import { AuthProvider } from "./contexts/AuthContext";
// 🔒 Componente de guarda (já existente no projeto)
import ProtectedRoute from "./components/ProtectedRoute";

// 🏛️ Páginas institucionais (públicas)
import Header from "./components/institutional/Header";
import Footer from "./components/institutional/Footer";
import Home from "./pages/institutional/Home";
import About from "./pages/institutional/About";
import InstitutionalServices from "./pages/institutional/Services";
import Contact from "./pages/institutional/Contact";
import Login from "./pages/Login";

// 🧭 Páginas do sistema (protegidas)
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Proposals from "./pages/Proposals";
import NewProposal from "./pages/NewProposal";
import Clients from "./pages/Clients";
import Services from "./pages/Services";
import Products from "./pages/Products";
import Reports from "./pages/Reports";
import UserManagement from "./pages/admin/UserManagement";

/** 🧱 Layout institucional para evitar repetição de Header/Footer */
function InstitutionalLayout({ children }: PropsWithChildren) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

export default function App() {
  return (
    // ✅ Provider no topo para toda a árvore
    <AuthProvider>
      <Router>
        <Routes>
          {/* 🏛️ Rotas públicas (site institucional) */}
          <Route
            path="/"
            element={
              <InstitutionalLayout>
                <Home />
              </InstitutionalLayout>
            }
          />
          <Route
            path="/sobre"
            element={
              <InstitutionalLayout>
                <About />
              </InstitutionalLayout>
            }
          />
          <Route
            path="/servicos"
            element={
              <InstitutionalLayout>
                <InstitutionalServices />
              </InstitutionalLayout>
            }
          />
          <Route
            path="/contato"
            element={
              <InstitutionalLayout>
                <Contact />
              </InstitutionalLayout>
            }
          />

          {/* 🔑 Login */}
          <Route path="/login" element={<Login />} />

          {/* 🛡️ Rotas protegidas (sistema) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/proposals"
            element={
              <ProtectedRoute>
                <Layout>
                  <Proposals />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/proposals/new"
            element={
              <ProtectedRoute>
                <Layout>
                  <NewProposal />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <ProtectedRoute>
                <Layout>
                  <Clients />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/services"
            element={
              <ProtectedRoute>
                <Layout>
                  <Services />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <Layout>
                  <Products />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* 👤 Admin */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute adminOnly>
                <Layout>
                  <UserManagement />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* ❓Fallback: qualquer rota desconhecida */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
