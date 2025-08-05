import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Institutional Components
import Header from './components/institutional/Header';
import Footer from './components/institutional/Footer';
import Home from './pages/institutional/Home';
import About from './pages/institutional/About';
import InstitutionalServices from './pages/institutional/Services';
import Contact from './pages/institutional/Contact';
import Login from './pages/Login';

// System Components
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Proposals from './pages/Proposals';
import NewProposal from './pages/NewProposal';
import Clients from './pages/Clients';
import Services from './pages/Services';
import Products from './pages/Products';
import Reports from './pages/Reports';
import UserManagement from './pages/admin/UserManagement';
import { initializeStorage } from './utils/storage';

function App() {
  useEffect(() => {
    initializeStorage();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Institutional Routes */}
          <Route path="/" element={
            <div>
              <Header />
              <Home />
              <Footer />
            </div>
          } />
          <Route path="/sobre" element={
            <div>
              <Header />
              <About />
              <Footer />
            </div>
          } />
          <Route path="/servicos" element={
            <div>
              <Header />
              <InstitutionalServices />
              <Footer />
            </div>
          } />
          <Route path="/contato" element={
            <div>
              <Header />
              <Contact />
              <Footer />
            </div>
          } />
          
          {/* Login */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected System Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/proposals" element={
            <ProtectedRoute>
              <Layout>
                <Proposals />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/proposals/new" element={
            <ProtectedRoute>
              <Layout>
                <NewProposal />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/clients" element={
            <ProtectedRoute>
              <Layout>
                <Clients />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/services" element={
            <ProtectedRoute>
              <Layout>
                <Services />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/products" element={
            <ProtectedRoute>
              <Layout>
                <Products />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute>
              <Layout>
                <Reports />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin/users" element={
            <ProtectedRoute adminOnly>
              <Layout>
                <UserManagement />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;