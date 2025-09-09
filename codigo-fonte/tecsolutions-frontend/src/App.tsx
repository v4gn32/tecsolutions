// Define todas as rotas do site e do sistema
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Páginas institucionais
import Home from "./pages/institutional/Home";
import About from "./pages/institutional/About";
import Services from "./pages/institutional/Services";
import Contact from "./pages/institutional/Contact";

// Sistema
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Proposals from "./pages/Proposals";
import NewProposal from "./pages/NewProposal";
import Clients from "./pages/Clients";
import Products from "./pages/Products";
import ServicesPage from "./pages/Services";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import Hardware from "./pages/inventory/Hardware";
import HardwareForm from "./pages/inventory/HardwareForm";
import Software from "./pages/inventory/Software";
import SoftwareForm from "./pages/inventory/SoftwareForm";
import Attendance from "./pages/tickets/Attendance";
import Remote from "./pages/tickets/Remote";
import Onsite from "./pages/tickets/Onsite";
import Lab from "./pages/tickets/Lab";
import ThirdParty from "./pages/tickets/ThirdParty";

export default function App() {
  return (
    // Provider de autenticação
    <AuthProvider>
      <Routes>
        {/* SITE */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/sobre" element={<About />} />
          <Route path="/servicos" element={<Services />} />
          <Route path="/contato" element={<Contact />} />
        </Route>

        {/* LOGIN fora do layout principal (sem header institucional) */}
        <Route path="/login" element={<Login />} />

        {/* SISTEMA protegido */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Layout isSystem />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="propostas" element={<Proposals />} />
          <Route path="propostas/nova" element={<NewProposal />} />
          <Route path="clientes" element={<Clients />} />
          <Route path="produtos" element={<Products />} />
          <Route path="servicos" element={<ServicesPage />} />
          <Route path="relatorios" element={<Reports />} />
          <Route path="usuarios" element={<Users />} />

          {/* Inventário */}
          <Route path="inventario/hardware" element={<Hardware />} />
          <Route path="inventario/hardware/novo" element={<HardwareForm />} />
          <Route path="inventario/software" element={<Software />} />
          <Route path="inventario/software/novo" element={<SoftwareForm />} />

          {/* Atendimentos */}
          <Route path="atendimentos" element={<Attendance />} />
          <Route path="atendimentos/remoto" element={<Remote />} />
          <Route path="atendimentos/presencial" element={<Onsite />} />
          <Route path="atendimentos/lab" element={<Lab />} />
          <Route path="atendimentos/terceiros" element={<ThirdParty />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
