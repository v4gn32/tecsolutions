import React, { useEffect, useMemo, useState } from "react";
import { PlusCircle, Search, Edit, Trash2, Tag } from "lucide-react";
// 🔗 Cliente HTTP central (configure tokens/interceptors em ../services/api)
import { api } from "../services/api";
import { Service } from "../types";

const Services: React.FC = () => {
  // -------------------- Estado base --------------------
  const [services, setServices] = useState<Service[]>([]); // lista vinda do backend
  const [searchTerm, setSearchTerm] = useState(""); // filtro texto
  const [categoryFilter, setCategoryFilter] = useState<string>("all"); // filtro categoria
  const [showModal, setShowModal] = useState(false); // modal create/edit
  const [editingService, setEditingService] = useState<Service | null>(null); // item em edição

  // -------------------- Estado de UI --------------------
  const [isLoading, setIsLoading] = useState<boolean>(false); // loading listagem
  const [isSaving, setIsSaving] = useState<boolean>(false); // loading submit
  const [error, setError] = useState<string | null>(null); // mensagem de erro

  // -------------------- Formulário --------------------
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "outros" as Service["category"],
    unit: "",
  });

  // Catálogo de categorias (pode vir do backend futuramente)
  const categories = [
    { value: "infraestrutura", label: "Infraestrutura" },
    { value: "helpdesk", label: "Helpdesk" },
    { value: "nuvem", label: "Nuvem" },
    { value: "backup", label: "Backup" },
    { value: "cabeamento", label: "Cabeamento" },
    { value: "outros", label: "Outros" },
  ];

  // -------------------- Carregar serviços (backend) --------------------
  const loadServices = async () => {
    // # Busca no backend com suporte a filtros via querystring
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (searchTerm.trim()) params.q = searchTerm.trim();
      if (categoryFilter !== "all") params.category = categoryFilter;

      const { data } = await api.get<Service[]>("/services", { params });
      setServices(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError("Falha ao carregar serviços. Tente novamente.");
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, categoryFilter]);

  // -------------------- Filtro local (fallback) --------------------
  const filteredServices = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return (services || []).filter((service) => {
      const matchesSearch =
        !term ||
        service.name?.toLowerCase().includes(term) ||
        service.description?.toLowerCase().includes(term);
      const matchesCategory =
        categoryFilter === "all" || service.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [services, searchTerm, categoryFilter]);

  // -------------------- Helpers --------------------
  const resetForm = () => {
    // # Limpa formulário e encerra modo edição
    setFormData({
      name: "",
      description: "",
      price: 0,
      category: "outros",
      unit: "",
    });
    setEditingService(null);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      infraestrutura: "bg-blue-100 text-blue-800",
      helpdesk: "bg-green-100 text-green-800",
      nuvem: "bg-purple-100 text-purple-800",
      backup: "bg-orange-100 text-orange-800",
      cabeamento: "bg-yellow-100 text-yellow-800",
      outros: "bg-gray-100 text-gray-800",
    };
    return (colors as any)[category] || colors.outros;
  };

  // -------------------- Submit (Create/Update) --------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      if (editingService) {
        // # Atualiza serviço existente
        await api.put(`/services/${editingService.id}`, { ...formData });
      } else {
        // # Cria novo serviço
        await api.post("/services", { ...formData });
      }

      await loadServices(); // # Recarrega lista após salvar
      setShowModal(false); // # Fecha modal
      resetForm(); // # Limpa formulário
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "Falha ao salvar o serviço. Verifique os campos e tente novamente.";
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // -------------------- Editar --------------------
  const handleEdit = (service: Service) => {
    // # Preenche formulário com dados do item e abre modal
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: Number(service.price) || 0,
      category: service.category,
      unit: service.unit,
    });
    setShowModal(true);
  };

  // -------------------- Excluir --------------------
  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este serviço?")) return;
    setError(null);
    try {
      await api.delete(`/services/${id}`);
      await loadServices();
    } catch (e: any) {
      setError("Falha ao excluir o serviço. Tente novamente.");
    }
  };

  // -------------------- Render --------------------
  return (
    <div className="space-y-6">
      {/* ==================== Header ==================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
          <p className="text-gray-600">Gerencie seu catálogo de serviços</p>
        </div>
        <button
          onClick={() => {
            resetForm(); // # garante form limpo
            setShowModal(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors duration-200"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Novo Serviço
        </button>
      </div>

      {/* ==================== Alertas ==================== */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm">
          {error}
        </div>
      )}

      {/* ==================== Filtros ==================== */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar serviços..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>
          {/* Categoria */}
          <div className="sm:w-48">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="all">Todas as Categorias</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ==================== Grid ==================== */}
      {isLoading ? (
        <div className="text-sm text-gray-500">Carregando serviços...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {service.name}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
                      service.category
                    )}`}
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {
                      categories.find((c) => c.value === service.category)
                        ?.label
                    }
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(service)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="text-gray-400 hover:text-red-600 p-1"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {service.description}
              </p>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    R$ {Number(service.price).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">por {service.unit}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {service.createdAt
                      ? `Criado em ${new Date(
                          service.createdAt as any
                        ).toLocaleDateString("pt-BR")}`
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ==================== Estado vazio ==================== */}
      {!isLoading && filteredServices.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum serviço encontrado
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || categoryFilter !== "all"
              ? "Tente ajustar os filtros de busca"
              : "Cadastre seu primeiro serviço para começar"}
          </p>
          {!searchTerm && categoryFilter === "all" && (
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors duration-200"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Cadastrar primeiro serviço
            </button>
          )}
        </div>
      )}

      {/* ==================== Modal (Criar/Editar) ==================== */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingService ? "Editar Serviço" : "Novo Serviço"}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Serviço *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as Service["category"],
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Preço + Unidade */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preço *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unidade *
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    placeholder="ex: hora, mês, projeto"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Ações do modal */}
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
                  className="px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors duration-200 disabled:opacity-70"
                >
                  {isSaving
                    ? "Salvando..."
                    : editingService
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

export default Services;
