// Conecta Products ao backend (sem mocks e sem mudar layout)
import React, { useState, useEffect } from "react";
import { PlusCircle, Search, Edit, Trash2, Package } from "lucide-react";
import { getProducts, saveProduct, deleteProduct } from "../utils/storage";
import { Product } from "../types";

const Products: React.FC = () => {
  // --- estados principais ---------------------------------------------------
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // --- controle leve --------------------------------------------------------
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- form -----------------------------------------------------------------
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "outros" as Product["category"],
    unit: "",
    brand: "",
    model: "",
    stock: 0,
  });

  const categories = [
    { value: "cabos", label: "Cabos" },
    { value: "conectores", label: "Conectores" },
    { value: "equipamentos", label: "Equipamentos" },
    { value: "acessorios", label: "Acessórios" },
    { value: "outros", label: "Outros" },
  ];

  // --- carregar do backend --------------------------------------------------
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError("Falha ao carregar produtos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // --- filtros locais (mantidos) -------------------------------------------
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.brand &&
        product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.model &&
        product.model.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // --- helpers --------------------------------------------------------------
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      category: "outros",
      unit: "",
      brand: "",
      model: "",
      stock: 0,
    });
    setEditingProduct(null);
  };

  // -- criar/editar produto (POST/PUT backend) ------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Comentário: payload. Se houver editingProduct.id, o storage fará PUT; senão, POST
    const payload: Partial<Product> = {
      ...(editingProduct?.id ? { id: editingProduct.id } : {}),
      ...formData,
      // createdAt é responsabilidade do backend; manter se veio ao editar
      ...(editingProduct?.createdAt
        ? { createdAt: editingProduct.createdAt }
        : {}),
    };

    try {
      setSaving(true);
      const saved = await saveProduct(payload as Product);
      if (!saved) throw new Error("Falha ao salvar");
      await loadProducts();
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Não foi possível salvar o produto.");
    } finally {
      setSaving(false);
    }
  };

  // -- abrir modal de edição -------------------------------------------------
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      unit: product.unit,
      brand: product.brand || "",
      model: product.model || "",
      stock: product.stock || 0,
    });
    setShowModal(true);
  };

  // -- excluir produto -------------------------------------------------------
  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este produto?")) return;
    const ok = await deleteProduct(id);
    if (ok) await loadProducts();
  };

  // -- helpers visuais -------------------------------------------------------
  const getCategoryColor = (category: string) => {
    const colors = {
      cabos: "bg-blue-100 text-blue-800",
      conectores: "bg-green-100 text-green-800",
      equipamentos: "bg-purple-100 text-purple-800",
      acessorios: "bg-orange-100 text-orange-800",
      outros: "bg-gray-100 text-gray-800",
    };
    return (colors as any)[category] || colors.outros;
  };

  const getStockStatus = (stock?: number) => {
    if (!stock || stock === 0)
      return { color: "text-red-600", label: "Sem estoque" };
    if (stock < 10) return { color: "text-yellow-600", label: "Estoque baixo" };
    return { color: "text-green-600", label: "Em estoque" };
  };

  // -- estados de carregamento/erro -----------------------------------------
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-sm opacity-70">Carregando produtos…</span>
      </div>
    );
  }
  if (error) return <div className="text-sm text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-600">Gerencie seu catálogo de produtos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors duration-200"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Novo Produto
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>
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

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const stockStatus = getStockStatus(product.stock);
          return (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
                      product.category
                    )}`}
                  >
                    <Package className="w-3 h-3 mr-1" />
                    {
                      categories.find((c) => c.value === product.category)
                        ?.label
                    }
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-gray-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {product.description}
              </p>

              {(product.brand || product.model) && (
                <div className="mb-4 text-sm text-gray-600">
                  {product.brand && (
                    <span className="font-medium">{product.brand}</span>
                  )}
                  {product.brand && product.model && <span> - </span>}
                  {product.model && <span>{product.model}</span>}
                </div>
              )}

              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    R$ {product.price.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">por {product.unit}</p>
                </div>
                {product.stock !== undefined && (
                  <div className="text-right">
                    <p className={`text-sm font-medium ${stockStatus.color}`}>
                      {stockStatus.label}
                    </p>
                    <p className="text-xs text-gray-500">
                      {product.stock} {product.unit}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  {/* Comentário: createdAt pode vir como string ISO; fallback seguro */}
                  Criado em{" "}
                  {new Date(product.createdAt as any).toLocaleDateString(
                    "pt-BR"
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum produto encontrado
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || categoryFilter !== "all"
              ? "Tente ajustar os filtros de busca"
              : "Cadastre seu primeiro produto para começar"}
          </p>
          {!searchTerm && categoryFilter === "all" && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors duration-200"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Cadastrar primeiro produto
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingProduct ? "Editar Produto" : "Novo Produto"}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Comentário: campos do formulário (mantidos) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Produto *
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as Product["category"],
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

              <div className="grid grid-cols-3 gap-4">
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
                    placeholder="ex: metro, unidade"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estoque
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stock: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marca
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData({ ...formData, brand: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modelo
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) =>
                      setFormData({ ...formData, model: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
              </div>

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
                  disabled={saving}
                  className="px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors duration-200 disabled:opacity-60"
                >
                  {saving
                    ? "Salvando…"
                    : editingProduct
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

export default Products;
