import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const Login: React.FC = () => {
  // -------------------- Estado do formulário --------------------
  const [formData, setFormData] = useState({ email: "", password: "" }); // campos de login
  const [showPassword, setShowPassword] = useState(false); // alterna visibilidade da senha
  const [error, setError] = useState(""); // mensagem de erro
  const [isLoading, setIsLoading] = useState(false); // loading do submit

  // -------------------- Autenticação/Navigation --------------------
  const { login } = useAuth(); // login usa token em memória (sem storage)
  const navigate = useNavigate();

  // -------------------- Submit do formulário --------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await login(formData); // chama backend: POST /login e depois GET /profile
      if (success) {
        navigate("/dashboard");
      } else {
        setError("Email ou senha incorretos");
      }
    } catch (err: any) {
      // tenta exibir mensagem vinda do backend se existir
      const backendMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Erro ao fazer login. Tente novamente.";
      setError(backendMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------- Atualiza campos --------------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-tecsolutions-primary via-blue-800 to-tecsolutions-primary flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* -------------------- Cabeçalho -------------------- */}
        <div className="text-center">
          <Link to="/" className="inline-block">
            <h1 className="text-4xl font-bold text-white mb-2">TecSolutions</h1>
          </Link>
          <p className="text-gray-200">Sistema de Propostas Comerciais</p>
        </div>

        {/* -------------------- Card de Login -------------------- */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="bg-tecsolutions-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-tecsolutions-accent" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Acesso ao Sistema
            </h2>
            <p className="text-gray-600 mt-2">Entre com suas credenciais</p>
          </div>

          {/* -------------------- Alerta de erro -------------------- */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* -------------------- Formulário -------------------- */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* E-mail */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tecsolutions-accent focus:border-transparent"
                placeholder="seu@email.com"
                autoComplete="username"
                required
              />
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tecsolutions-accent focus:border-transparent"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Entrar */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-tecsolutions-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-opacity-90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        {/* -------------------- Voltar ao site -------------------- */}
        <div className="text-center">
          <Link
            to="/"
            className="text-tecsolutions-accent hover:text-white transition-colors duration-200"
          >
            ← Voltar ao site institucional
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
