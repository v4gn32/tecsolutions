import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Trash2, Save, Send, Download } from "lucide-react";
// 🔗 API central (token em memória via interceptor)
import { api } from "../services/api";
import { generateProposalPDF } from "../utils/pdfGenerator";
import {
  Client,
  Service,
  Product,
  Proposal,
  ProposalItem,
  ProposalProductItem,
  ProposalWithDetails,
} from "../types";

const NewProposal: React.FC = () => {
  const navigate = useNavigate();

  // -------------------- Estados de dados (vindos do backend) --------------------
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // -------------------- Estados de UI --------------------
  const [isLoading, setIsLoading] = useState<boolean>(false); // loading listas
  const [isSaving, setIsSaving] = useState<boolean>(false); // loading submit
  const [error, setError] = useState<string | null>(null); // mensagem de erro

  // -------------------- Formulário --------------------
  const [formData, setFormData] = useState({
    clientId: "",
    title: "",
    description: "",
    discount: 0,
    // default = hoje + 30 dias (aaaa-mm-dd)
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    notes: "",
  });

  // -------------------- Itens (serviços/produtos) --------------------
  const [items, setItems] = useState<ProposalItem[]>([]);
  const [productItems, setProductItems] = useState<ProposalProductItem[]>([]);

  // ==================== Carregar listas do backend ====================
  useEffect(() => {
    const loadAll = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [cRes, sRes, pRes] = await Promise.all([
          api.get<Client[]>("/clients"),
          api.get<Service[]>("/services"),
          api.get<Product[]>("/products"),
        ]);
        setClients(Array.isArray(cRes.data) ? cRes.data : []);
        setServices(Array.isArray(sRes.data) ? sRes.data : []);
        setProducts(Array.isArray(pRes.data) ? pRes.data : []);
      } catch (e: any) {
        setError(
          "Falha ao carregar clientes/serviços/produtos. Tente novamente."
        );
      } finally {
        setIsLoading(false);
      }
    };
    loadAll();
  }, []);

  // ==================== Utilitários de itens (Serviços) ====================
  // # Adiciona um item de serviço
  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { serviceId: "", quantity: 1, unitPrice: 0, total: 0 },
    ]);
  };

  // # Atualiza um item de serviço e recalcula total
  const updateItem = (
    index: number,
    field: keyof ProposalItem,
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === "serviceId") {
      const service = services.find((s) => s.id === value);
      if (service) {
        newItems[index].unitPrice = Number(service.price) || 0;
        newItems[index].total =
          newItems[index].quantity * (Number(service.price) || 0);
      }
    } else if (field === "quantity" || field === "unitPrice") {
      newItems[index].total =
        (Number(newItems[index].quantity) || 0) *
        (Number(newItems[index].unitPrice) || 0);
    }

    setItems(newItems);
  };

  // # Remove item de serviço
  const removeItem = (index: number) =>
    setItems(items.filter((_, i) => i !== index));

  // ==================== Utilitários de itens (Produtos) ====================
  // # Adiciona um item de produto
  const addProductItem = () => {
    setProductItems((prev) => [
      ...prev,
      { productId: "", quantity: 1, unitPrice: 0, total: 0 },
    ]);
  };

  // # Atualiza um item de produto e recalcula total
  const updateProductItem = (
    index: number,
    field: keyof ProposalProductItem,
    value: string | number
  ) => {
    const newItems = [...productItems];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === "productId") {
      const product = products.find((p) => p.id === value);
      if (product) {
        newItems[index].unitPrice = Number(product.price) || 0;
        newItems[index].total =
          newItems[index].quantity * (Number(product.price) || 0);
      }
    } else if (field === "quantity" || field === "unitPrice") {
      newItems[index].total =
        (Number(newItems[index].quantity) || 0) *
        (Number(newItems[index].unitPrice) || 0);
    }

    setProductItems(newItems);
  };

  // # Remove item de produto
  const removeProductItem = (index: number) =>
    setProductItems(productItems.filter((_, i) => i !== index));

  // ==================== Cálculos ====================
  const servicesSubtotal = items.reduce(
    (sum, item) => sum + (Number(item.total) || 0),
    0
  );
  const productsSubtotal = productItems.reduce(
    (sum, item) => sum + (Number(item.total) || 0),
    0
  );
  const subtotal = servicesSubtotal + productsSubtotal;
  const total = Math.max(0, subtotal - (Number(formData.discount) || 0));

  // ==================== Helpers ====================
  // # Gera número de proposta no cliente (o backend pode sobrescrever)
  const generateProposalNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `PROP-${year}${month}${day}-${random}`;
  };

  // ==================== Salvar/Enviar Proposta ====================
  // # Valida campos obrigatórios
  const validateRequired = () => {
    return (
      !!formData.clientId &&
      !!formData.title &&
      (items.length > 0 || productItems.length > 0)
    );
  };

  // # Salva no backend com status informado
  const handleSave = async (status: "rascunho" | "enviada") => {
    if (!validateRequired()) {
      alert(
        "Preencha os obrigatórios e adicione ao menos 1 serviço ou produto."
      );
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const payload: Omit<
        Proposal,
        "id" | "createdAt" | "updatedAt" | "number"
      > & {
        number?: string;
      } = {
        clientId: formData.clientId,
        number: generateProposalNumber(), // o backend pode ignorar e gerar o próprio
        title: formData.title,
        description: formData.description,
        items,
        productItems,
        subtotal,
        discount: Number(formData.discount) || 0,
        total,
        status,
        validUntil: new Date(formData.validUntil) as any,
        notes: formData.notes,
      };

      // POST /proposals cria e retorna { id, number, ... }
      await api.post("/proposals", payload);

      alert(
        status === "enviada"
          ? "Proposta enviada com sucesso!"
          : "Proposta salva como rascunho!"
      );
      navigate("/proposals");
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "Falha ao salvar a proposta. Tente novamente.";
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // ==================== Gerar PDF local (sem persistir) ====================
  const handleGeneratePDF = () => {
    if (!validateRequired()) {
      alert(
        "Preencha os obrigatórios e adicione ao menos 1 serviço ou produto."
      );
      return;
    }

    const client = clients.find((c) => c.id === formData.clientId);
    if (!client) return;

    const proposalWithDetails: ProposalWithDetails = {
      id: "temp",
      clientId: formData.clientId,
      number: generateProposalNumber(),
      title: formData.title,
      description: formData.description,
      items,
      productItems,
      subtotal,
      discount: Number(formData.discount) || 0,
      total,
      status: "rascunho",
      validUntil: new Date(formData.validUntil),
      createdAt: new Date(),
      updatedAt: new Date(),
      notes: formData.notes,
      client,
      services,
      products,
    };

    generateProposalPDF(proposalWithDetails);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ==================== Header ==================== */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Nova Proposta</h1>
        <p className="text-gray-600">
          Crie uma nova proposta comercial para seus clientes
        </p>
      </div>

      {/* ==================== Alertas ==================== */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm">
          {error}
        </div>
      )}
      {isLoading && (
        <div className="text-sm text-gray-500">Carregando dados...</div>
      )}

      {/* ==================== Informações Básicas ==================== */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Informações Básicas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cliente *
            </label>
            <select
              value={formData.clientId}
              onChange={(e) =>
                setFormData({ ...formData, clientId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              required
            >
              <option value="">Selecione um cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.company} - {client.name}
                </option>
              ))}
            </select>
          </div>

          {/* Validade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Válida até *
            </label>
            <input
              type="date"
              value={formData.validUntil}
              onChange={(e) =>
                setFormData({ ...formData, validUntil: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Título */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título da Proposta *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Ex: Proposta para Infraestrutura de TI"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            required
          />
        </div>

        {/* Descrição */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
            placeholder="Descreva os objetivos e escopo da proposta..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* ==================== Serviços ==================== */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Serviços</h2>
          <button
            onClick={addItem}
            className="inline-flex items-center px-3 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors duration-200"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Adicionar Serviço
          </button>
        </div>

        {items.length > 0 ? (
          <div className="space-y-4">
            {items.map((item, index) => {
              const service = services.find((s) => s.id === item.serviceId);
              return (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-4 items-end p-4 border border-gray-200 rounded-lg"
                >
                  {/* Serviço */}
                  <div className="col-span-12 md:col-span-5">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Serviço
                    </label>
                    <select
                      value={item.serviceId}
                      onChange={(e) =>
                        updateItem(index, "serviceId", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="">Selecione um serviço</option>
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name} - {service.category}
                        </option>
                      ))}
                    </select>
                    {service && (
                      <p className="text-xs text-gray-500 mt-1">
                        {service.description} (Unidade: {service.unit})
                      </p>
                    )}
                  </div>

                  {/* Qtd */}
                  <div className="col-span-4 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Qtd
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "quantity",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>

                  {/* Valor Unit. */}
                  <div className="col-span-4 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor Unit.
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "unitPrice",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>

                  {/* Total */}
                  <div className="col-span-3 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                      R$ {Number(item.total).toFixed(2)}
                    </div>
                  </div>

                  {/* Remover */}
                  <div className="col-span-1">
                    <button
                      onClick={() => removeItem(index)}
                      className="p-2 text-red-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Remover serviço"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500 mb-2">Nenhum serviço adicionado</p>
            <button
              onClick={addItem}
              className="text-cyan-600 hover:text-cyan-500 font-medium"
            >
              Adicionar primeiro serviço
            </button>
          </div>
        )}

        {items.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal Serviços:</span>
              <span className="font-medium text-gray-900">
                R$ {servicesSubtotal.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ==================== Produtos ==================== */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Produtos</h2>
          <button
            onClick={addProductItem}
            className="inline-flex items-center px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors duration-200"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Adicionar Produto
          </button>
        </div>

        {productItems.length > 0 ? (
          <div className="space-y-4">
            {productItems.map((item, index) => {
              const product = products.find((p) => p.id === item.productId);
              return (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-4 items-end p-4 border border-purple-200 rounded-lg bg-purple-50"
                >
                  {/* Produto */}
                  <div className="col-span-12 md:col-span-5">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Produto
                    </label>
                    <select
                      value={item.productId}
                      onChange={(e) =>
                        updateProductItem(index, "productId", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Selecione um produto</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} - {product.category}
                        </option>
                      ))}
                    </select>
                    {product && (
                      <p className="text-xs text-gray-500 mt-1">
                        {product.description} (Unidade: {product.unit})
                        {product.brand && ` - ${product.brand}`}
                        {product.model && ` ${product.model}`}
                      </p>
                    )}
                  </div>

                  {/* Qtd */}
                  <div className="col-span-4 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Qtd
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateProductItem(
                          index,
                          "quantity",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* Valor Unit. */}
                  <div className="col-span-4 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor Unit.
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateProductItem(
                          index,
                          "unitPrice",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* Total */}
                  <div className="col-span-3 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total
                    </label>
                    <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
                      R$ {Number(item.total).toFixed(2)}
                    </div>
                  </div>

                  {/* Remover */}
                  <div className="col-span-1">
                    <button
                      onClick={() => removeProductItem(index)}
                      className="p-2 text-red-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Remover produto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-purple-300 rounded-lg bg-purple-50">
            <p className="text-gray-500 mb-2">Nenhum produto adicionado</p>
            <button
              className="text-purple-600 hover:text-purple-500 font-medium"
              onClick={addProductItem}
            >
              Adicionar primeiro produto
            </button>
          </div>
        )}

        {productItems.length > 0 && (
          <div className="mt-4 pt-4 border-t border-purple-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal Produtos:</span>
              <span className="font-medium text-gray-900">
                R$ {productsSubtotal.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ==================== Totais e Ações ==================== */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Observações */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Observações
            </h3>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={4}
              placeholder="Observações adicionais, termos, condições..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Totais */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Totais</h3>
            <div className="space-y-3">
              {servicesSubtotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Serviços:</span>
                  <span className="font-medium">
                    R$ {servicesSubtotal.toFixed(2)}
                  </span>
                </div>
              )}

              {productsSubtotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Produtos:</span>
                  <span className="font-medium">
                    R$ {productsSubtotal.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Desconto:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={subtotal}
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                  />
                </div>
              </div>

              <hr className="border-gray-200" />

              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span className="text-cyan-600">R$ {total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-end">
          {/* Gerar PDF local */}
          <button
            onClick={handleGeneratePDF}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Gerar PDF
          </button>

          {/* Salvar rascunho (POST /proposals) */}
          <button
            onClick={() => handleSave("rascunho")}
            disabled={isSaving}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-70"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar Rascunho"}
          </button>

          {/* Enviar proposta (POST /proposals com status 'enviada') */}
          <button
            onClick={() => handleSave("enviada")}
            disabled={isSaving}
            className="inline-flex items-center justify-center px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors duration-200 disabled:opacity-70"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSaving ? "Enviando..." : "Enviar Proposta"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewProposal;
