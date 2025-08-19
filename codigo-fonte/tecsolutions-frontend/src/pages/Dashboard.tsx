import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Users,
  Settings,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  PlusCircle,
  Package,
} from "lucide-react";
// 🔗 API central (token em memória via interceptor)
import { api } from "../services/api";
import { Proposal, Client, Service, Product } from "../types";
import StatusBadge from "../components/StatusBadge";

const Dashboard: React.FC = () => {
  // -------------------- Estados --------------------
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // loading global
  const [error, setError] = useState<string | null>(null); // erro simples

  // -------------------- Carregar dados do backend --------------------
  const loadAll = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // # Busca todos os recursos em paralelo
      const [pRes, cRes, sRes, prRes] = await Promise.all([
        api.get<Proposal[]>("/proposals"),
        api.get<Client[]>("/clients"),
        api.get<Service[]>("/services"),
        api.get<Product[]>("/products"),
      ]);

      setProposals(Array.isArray(pRes.data) ? pRes.data : []);
      setClients(Array.isArray(cRes.data) ? cRes.data : []);
      setServices(Array.isArray(sRes.data) ? sRes.data : []);
      setProducts(Array.isArray(prRes.data) ? prRes.data : []);
    } catch (e: any) {
      setError("Falha ao carregar dados da dashboard. Tente novamente.");
      setProposals([]);
      setClients([]);
      setServices([]);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // # Carrega ao montar
    loadAll();
  }, []);

  // -------------------- Cálculos / Memos --------------------
  const totalItems = useMemo(
    () => (services?.length || 0) + (products?.length || 0),
    [services, products]
  );

  const approvedCount = useMemo(
    () => proposals.filter((p) => p.status === "aprovada").length,
    [proposals]
  );

  const conversionRate = useMemo(() => {
    const total = proposals.length;
    if (!total) return "0%";
    return `${Math.round((approvedCount / total) * 100)}%`;
  }, [approvedCount, proposals.length]);

  const recentProposals = useMemo(() => {
    // # Ordena por createdAt (desc) e pega 5
    return [...proposals]
      .sort(
        (a, b) =>
          new Date(b.createdAt as any).getTime() -
          new Date(a.createdAt as any).getTime()
      )
      .slice(0, 5);
  }, [proposals]);

  const totalApprovedValue = useMemo(() => {
    // # Soma total apenas das aprovadas
    const sum = proposals
      .filter((p) => p.status === "aprovada")
      .reduce((acc, p) => acc + (Number(p.total) || 0), 0);
    return sum;
  }, [proposals]);

  const formatBRL = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // -------------------- Estatísticas (UI) --------------------
  const stats = [
    {
      title: "Total de Propostas",
      value: proposals.length,
      icon: FileText,
      color: "bg-blue-600",
      change: "+12%", // placeholder visual
    },
    {
      title: "Clientes Ativos",
      value: clients.length,
      icon: Users,
      color: "bg-green-500",
      change: "+5%", // placeholder visual
    },
    {
      title: "Itens Cadastrados",
      value: totalItems,
      icon: Settings,
      color: "bg-indigo-600",
      change: "+8%", // placeholder visual
    },
    {
      title: "Taxa de Conversão",
      value: conversionRate,
      icon: TrendingUp,
      color: "bg-cyan-500",
      change: "+3%", // placeholder visual
    },
  ];

  // -------------------- Render --------------------
  return (
    <div className="space-y-6">
      {/* ==================== Alertas ==================== */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm">
          {error}
        </div>
      )}

      {/* ==================== Stats Cards ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
            >
              <div className="flex items-center">
                <div className={`${stat.color} rounded-lg p-3 mr-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="ml-2 text-sm font-medium text-green-600">
                      {stat.change}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ==================== Ações Rápidas ==================== */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Ações Rápidas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/proposals/new"
            className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-cyan-500 hover:bg-cyan-50 transition-colors duration-200"
          >
            <PlusCircle className="w-8 h-8 text-cyan-500 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Nova Proposta</p>
              <p className="text-sm text-gray-600">
                Criar uma nova proposta comercial
              </p>
            </div>
          </Link>

          <Link
            to="/clients"
            className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-cyan-500 hover:bg-cyan-50 transition-colors duration-200"
          >
            <Users className="w-8 h-8 text-cyan-500 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Gerenciar Clientes</p>
              <p className="text-sm text-gray-600">
                Cadastrar e editar clientes
              </p>
            </div>
          </Link>

          <Link
            to="/services"
            className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-cyan-500 hover:bg-cyan-50 transition-colors duration-200"
          >
            <Settings className="w-8 h-8 text-cyan-500 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Configurar Serviços</p>
              <p className="text-sm text-gray-600">
                Gerenciar catálogo de serviços
              </p>
            </div>
          </Link>

          <Link
            to="/products"
            className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-cyan-500 hover:bg-cyan-50 transition-colors duration-200"
          >
            <Package className="w-8 h-8 text-cyan-500 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Gerenciar Produtos</p>
              <p className="text-sm text-gray-600">
                Cadastrar cabos, conectores, etc.
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* ==================== Propostas Recentes + Resumo ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ------- Propostas Recentes ------- */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Propostas Recentes
              </h3>
              <Link
                to="/proposals"
                className="text-sm text-cyan-600 hover:text-cyan-500 font-medium"
              >
                Ver todas
              </Link>
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              // # Loading simples para a seção
              <div className="text-sm text-gray-500">
                Carregando propostas...
              </div>
            ) : recentProposals.length > 0 ? (
              <div className="space-y-4">
                {recentProposals.map((proposal) => {
                  const client = clients.find(
                    (c) => c.id === proposal.clientId
                  );
                  return (
                    <div
                      key={proposal.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {proposal.number}
                        </p>
                        <p className="text-sm text-gray-600">
                          {client?.company || "Cliente não encontrado"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {proposal.createdAt
                            ? new Date(
                                proposal.createdAt as any
                              ).toLocaleDateString("pt-BR")
                            : "—"}
                        </p>
                      </div>
                      <div className="text-right">
                        <StatusBadge status={proposal.status as any} />
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {formatBRL(Number(proposal.total) || 0)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhuma proposta criada ainda</p>
                <Link
                  to="/proposals/new"
                  className="mt-2 inline-flex items-center text-sm text-cyan-600 hover:text-cyan-500"
                >
                  Criar primeira proposta
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ------- Resumo Financeiro ------- */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Resumo Financeiro
            </h3>
          </div>
          <div className="p-6">
            {isLoading ? (
              // # Loading simples para a seção
              <div className="text-sm text-gray-500">Calculando resumo...</div>
            ) : (
              <>
                <div className="space-y-4">
                  {/* Valor total aprovado */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <DollarSign className="w-5 h-5 text-green-500 mr-2" />
                      <span className="text-gray-700">
                        Valor Total Aprovado
                      </span>
                    </div>
                    <span className="font-semibold text-green-600">
                      {formatBRL(totalApprovedValue)}
                    </span>
                  </div>

                  {/* Propostas pendentes (enviada) */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-yellow-500 mr-2" />
                      <span className="text-gray-700">Propostas Pendentes</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {proposals.filter((p) => p.status === "enviada").length}
                    </span>
                  </div>

                  {/* Taxa de aprovação */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      <span className="text-gray-700">Taxa de Aprovação</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {conversionRate}
                    </span>
                  </div>
                </div>

                {/* Distribuição por Status */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Distribuição por Status
                  </h4>
                  <div className="space-y-2">
                    {["rascunho", "enviada", "aprovada", "recusada"].map(
                      (status) => {
                        const count = proposals.filter(
                          (p) => p.status === status
                        ).length;
                        const percentage =
                          proposals.length > 0
                            ? (count / proposals.length) * 100
                            : 0;

                        return (
                          <div
                            key={status}
                            className="flex items-center justify-between text-sm"
                          >
                            <StatusBadge status={status as any} />
                            <div className="flex items-center">
                              <span className="text-gray-600 mr-2">
                                {count}
                              </span>
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-cyan-500 h-2 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
