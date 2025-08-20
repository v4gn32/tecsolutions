// src/pages/admin/UserManagement.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  PlusCircle,
  Search,
  Edit,
  Trash2,
  Users,
  Shield,
  User,
} from "lucide-react";
// 🔗 HTTP client com token via interceptors
import { api } from "../../services/api";
// ⚙️ Tipos (role vindo do backend como 'ADMIN' | 'USER')
import { User as UserType } from "../../types/auth";
import { useAuth } from "../../contexts/AuthContext";

// 🔁 Mapeia role do formulário (minúsculas) ⇄ backend (maiúsculas)
const toBackendRole = (r: "admin" | "user") =>
  r === "admin" ? "ADMIN" : "USER";
const fromBackendRole = (r: string) =>
  r?.toUpperCase() === "ADMIN" ? "admin" : "user";

const UserManagement: React.FC = () => {
  // -------------------- Estado base --------------------
  const [users, setUsers] = useState<UserType[]>([]); // lista do backend
  const [searchTerm, setSearchTerm] = useState(""); // busca por nome/email
  const [showModal, setShowModal] = useState(false); // modal create/edit
  const [editingUser, setEditingUser] = useState<UserType | null>(null); // item em edição
  const { user: currentUser } = useAuth(); // usuário logado

  // 🚫 Flag de permissão (somente ADMIN pode gerenciar)
  const isAdmin = currentUser?.role?.toUpperCase() === "ADMIN";

  // -------------------- Estado de UI --------------------
  const [isLoading, setIsLoading] = useState(false); // loading tabela
  const [isSaving, setIsSaving] = useState(false); // loading submit
  const [error, setError] = useState<string | null>(null); // alerta de erro

  // -------------------- Formulário --------------------
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user" as "admin" | "user",
    password: "", // no edit é opcional
  });

  // -------------------- Buscar usuários (backend) --------------------
  const loadUsers = async () => {
    // 🔎 carrega lista do backend (com filtro opcional ?q=)
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (searchTerm.trim()) params.q = searchTerm.trim();

      const { data } = await api.get<UserType[]>("/admin/users", { params });
      setUsers(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(
        e?.response?.data?.error ||
          e?.response?.data?.message ||
          "Falha ao carregar usuários. Tente novamente."
      );
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 🔁 recarrega ao digitar na busca
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // -------------------- Filtro local (fallback) --------------------
  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return (users || []).filter(
      (u) =>
        !term ||
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  // -------------------- Helpers --------------------
  const resetForm = () => {
    // 🧹 limpa formulário e estado de edição
    setFormData({ name: "", email: "", role: "user", password: "" });
    setEditingUser(null);
  };

  // -------------------- Criar/Atualizar --------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setError("Apenas Administrador pode salvar usuários.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (editingUser) {
        // ✏️ Atualiza usuário (senha opcional)
        const payload: any = {
          name: formData.name,
          email: formData.email,
          role: toBackendRole(formData.role), // ✅ envia em MAIÚSCULAS
        };
        if (formData.password.trim()) payload.password = formData.password;

        await api.put(`/admin/users/${editingUser.id}`, payload);
      } else {
        // ➕ Cria usuário (senha obrigatória)
        await api.post("/admin/users", {
          name: formData.name,
          email: formData.email,
          role: toBackendRole(formData.role), // ✅ envia em MAIÚSCULAS
          password: formData.password,
        });
      }

      await loadUsers(); // 🔄 recarrega lista
      setShowModal(false); // ❌ fecha modal
      resetForm(); // 🧹 limpa
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "Falha ao salvar o usuário. Verifique os dados e tente novamente.";
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // -------------------- Editar --------------------
  const handleEdit = (user: UserType) => {
    // ✏️ carrega dados para edição
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: fromBackendRole(user.role) as "admin" | "user", // ✅ normaliza
      password: "",
    });
    setShowModal(true);
  };

  // -------------------- Excluir --------------------
  const handleDelete = async (id: string) => {
    if (!isAdmin) {
      setError("Apenas Administrador pode excluir usuários.");
      return;
    }
    if (id === currentUser?.id) {
      alert("Você não pode excluir sua própria conta!");
      return;
    }
    if (!window.confirm("Tem certeza que deseja excluir este usuário?")) return;

    setError(null);
    try {
      await api.delete(`/admin/users/${id}`);
      await loadUsers();
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          "Falha ao excluir o usuário. Tente novamente."
      );
    }
  };

  // -------------------- Render --------------------
  return (
    <div className="space-y-6">
      {/* ==================== Header ==================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gerenciar Usuários
          </h1>
          <p className="text-gray-600">Controle de acesso ao sistema</p>
        </div>

        {/* 🔒 Botão só para ADMIN */}
        {isAdmin && (
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-tecsolutions-primary text-white text-sm font-medium rounded-lg hover:bg-opacity-90 transition-colors duration-200"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Novo Usuário
          </button>
        )}
      </div>

      {/* ==================== Alertas/Busca ==================== */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar usuários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tecsolutions-accent focus:border-transparent"
          />
        </div>
        {isLoading && (
          <p className="mt-3 text-sm text-gray-500">Carregando usuários...</p>
        )}
      </div>

      {/* ==================== Tabela ==================== */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Perfil
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data de Criação
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-tecsolutions-primary rounded-full w-10 h-10 flex items-center justify-center mr-4">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role?.toString().toUpperCase() === "ADMIN"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.role?.toString().toUpperCase() === "ADMIN" ? (
                          <>
                            <Shield className="w-3 h-3 mr-1" />
                            Administrador
                          </>
                        ) : (
                          <>
                            <Users className="w-3 h-3 mr-1" />
                            Usuário
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.createdAt
                        ? new Date(user.createdAt as any).toLocaleDateString(
                            "pt-BR"
                          )
                        : "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {/* ✏️ Ações só para ADMIN */}
                        {isAdmin && (
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-tecsolutions-primary hover:text-opacity-80 p-1"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {isAdmin && user.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-500 p-1"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          // Estado vazio
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum usuário encontrado
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? "Tente ajustar o termo de busca"
                : "Cadastre o primeiro usuário para começar"}
            </p>
          </div>
        )}
      </div>

      {/* ==================== Modal (Criar/Editar) ==================== */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingUser ? "Editar Usuário" : "Novo Usuário"}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tecsolutions-accent focus:border-transparent"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tecsolutions-accent focus:border-transparent"
                  required
                />
              </div>

              {/* Perfil */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Perfil *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as "admin" | "user",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tecsolutions-accent focus:border-transparent"
                  required
                >
                  <option value="user">Usuário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              {/* Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha{" "}
                  {editingUser ? "(deixe em branco para manter a atual)" : "*"}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tecsolutions-accent focus:border-transparent"
                  required={!editingUser}
                />
              </div>

              {/* Ações */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-tecsolutions-primary text-white text-sm font-medium rounded-lg hover:bg-opacity-90 transition-colors duration-200 disabled:opacity-70"
                >
                  {isSaving
                    ? "Salvando..."
                    : editingUser
                    ? "Atualizar"
                    : "Cadastrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
