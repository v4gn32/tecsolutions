import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  FileText,
  Calendar,
  Download,
} from "lucide-react";
// 🔗 API central (token em memória via interceptor)
import { api } from "../services/api";
import { Proposal, Client, Service } from "../types";
import StatusBadge from "../components/StatusBadge";

const Reports: React.FC = () => {
  // -------------------- Estados base --------------------
  const [proposals, setProposals] = useState<Proposal[]>([]); // propostas (filtradas por período)
  const [clients, setClients] = useState<Client[]>([]); // clientes
  const [services, setServices] = useState<Service[]>([]); // serviços
  const [isLoading, setIsLoading] = useState<boolean>(false); // loading geral
  const [error, setError] = useState<string | null>(null); // erro geral

  // -------------------- Filtro de período --------------------
  const [dateRange, setDateRange] = useState({
    // início = 1º dia do mês atual (aaaa-mm-dd)
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    // fim = hoje (aaaa-mm-dd)
    end: new Date().toISOString().split("T")[0],
  });

  // -------------------- Carregar dados do backend --------------------
  const loadAll = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // # Busca propostas já filtradas por período no backend (se suportado)
      const [pRes, cRes, sRes] = await Promise.all([
        api.get<Proposal[]>("/proposals", {
          params: { start: dateRange.start, end: dateRange.end },
        }),
        api.get<Client[]>("/clients"),
        api.get<Service[]>("/services"),
      ]);

      setProposals(Array.isArray(pRes.data) ? pRes.data : []);
      setClients(Array.isArray(cRes.data) ? cRes.data : []);
      setServices(Array.isArray(sRes.data) ? sRes.data : []);
    } catch (e: any) {
      setError("Falha ao carregar dados do relatório. Tente novamente.");
      setProposals([]);
      setClients([]);
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // # Carrega ao montar e sempre que o período mudar
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange.start, dateRange.end]);

  // -------------------- Fallback de filtro por período (cliente) --------------------
  const filteredProposals = useMemo(() => {
    if (!proposals?.length) return [];
    // Se o backend já filtrou, isso só garante correção.
    const start = new Date(`${dateRange.start}T00:00:00`);
    const end = new Date(`${dateRange.end}T23:59:59`);
    return proposals.filter((p) => {
      const d = p.createdAt ? new Date(p.createdAt as any) : null;
      return d && d >= start && d <= end;
    });
  }, [proposals, dateRange]);

  // -------------------- Estatísticas principais --------------------
  const totalProposals = filteredProposals.length;
  const approvedProposals = filteredProposals.filter(
    (p) => p.status === "aprovada"
  );
  const totalRevenue = approvedProposals.reduce(
    (sum, p) => sum + (Number(p.total) || 0),
    0
  );
  const conversionRate =
    totalProposals > 0 ? (approvedProposals.length / totalProposals) * 100 : 0;
  const averageValue =
    approvedProposals.length > 0 ? totalRevenue / approvedProposals.length : 0;

  // -------------------- Distribuição por status --------------------
  const statusStats = useMemo(
    () => [
      {
        status: "rascunho",
        count: filteredProposals.filter((p) => p.status === "rascunho").length,
      },
      {
        status: "enviada",
        count: filteredProposals.filter((p) => p.status === "enviada").length,
      },
      {
        status: "aprovada",
        count: filteredProposals.filter((p) => p.status === "aprovada").length,
      },
      {
        status: "recusada",
        count: filteredProposals.filter((p) => p.status === "recusada").length,
      },
    ],
    [filteredProposals]
  );

  // -------------------- Top clientes (por receita aprovada) --------------------
  const clientStats = useMemo(() => {
    const list = clients
      .map((client) => {
        const cp = filteredProposals.filter((p) => p.clientId === client.id);
        const approvedValue = cp
          .filter((p) => p.status === "aprovada")
          .reduce((sum, p) => sum + (Number(p.total) || 0), 0);

        return {
          client,
          proposalCount: cp.length,
          totalValue: approvedValue,
        };
      })
      .filter((x) => x.proposalCount > 0)
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5);
    return list;
  }, [clients, filteredProposals]);

  // -------------------- Top serviços (uso + receita aprovada) --------------------
  const serviceStats = useMemo(() => {
    const byService = services
      .map((service) => {
        // uso total (todas as propostas do período)
        const usage = filteredProposals.reduce((count, proposal) => {
          const serviceItems = (proposal.items || []).filter(
            (it) => it.serviceId === service.id
          );
          return (
            count +
            serviceItems.reduce((s, it) => s + (Number(it.quantity) || 0), 0)
          );
        }, 0);

        // receita (somente propostas aprovadas)
        const revenue = filteredProposals
          .filter((p) => p.status === "aprovada")
          .reduce((sum, proposal) => {
            const serviceItems = (proposal.items || []).filter(
              (it) => it.serviceId === service.id
            );
            return (
              sum +
              serviceItems.reduce((acc, it) => acc + (Number(it.total) || 0), 0)
            );
          }, 0);

        return { service, usage, revenue };
      })
      .filter((x) => x.usage > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return byService;
  }, [services, filteredProposals]);

  // -------------------- Exportar relatório (JSON local) --------------------
  const exportReport = () => {
    const reportData = {
      period: `${dateRange.start} a ${dateRange.end}`,
      summary: {
        totalProposals,
        approvedProposals: approvedProposals.length,
        totalRevenue,
        conversionRate,
        averageValue,
      },
      statusDistribution: statusStats,
      topClients: clientStats.map((c) => ({
        client: {
          id: c.client.id,
          name: c.client.name,
          company: c.client.company,
        },
        proposalCount: c.proposalCount,
        totalValue: c.totalValue,
      })),
      topServices: serviceStats.map((s) => ({
        service: {
          id: s.service.id,
          name: s.service.name,
          category: s.service.category,
        },
        usage: s.usage,
        revenue: s.revenue,
      })),
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio_${dateRange.start}_${dateRange.end}.json`;
    link.click();
  };

  // -------------------- Render --------------------
  return (
    <div className="space-y-6">
      {/* ==================== Header ==================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Análise de desempenho e métricas</p>
        </div>
        <button
          onClick={exportReport}
          className="inline-flex items-center px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors duration-200"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar Relatório
        </button>
      </div>

      {/* ==================== Alertas/Loading ==================== */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm">
          {error}
        </div>
      )}
      {isLoading && (
        <div className="text-sm text-gray-500">Carregando dados...</div>
      )}

      {/* ==================== Período ==================== */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Período:</span>
          </div>
          <div className="flex space-x-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((p) => ({ ...p, start: e.target.value }))
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
            <span className="py-2 text-gray-500">até</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((p) => ({ ...p, end: e.target.value }))
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* ==================== Métricas principais ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-500 rounded-lg p-3 mr-4">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total de Propostas
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {totalProposals}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-500 rounded-lg p-3 mr-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Taxa de Conversão
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {conversionRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-cyan-500 rounded-lg p-3 mr-4">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Receita Total</p>
              <p className="text-2xl font-semibold text-gray-900">
                R$ {totalRevenue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-purple-500 rounded-lg p-3 mr-4">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
              <p className="text-2xl font-semibold text-gray-900">
                R$ {averageValue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== Gráficos/Listas ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Distribuição por Status
          </h3>
          <div className="space-y-4">
            {statusStats.map(({ status, count }) => {
              const percentage =
                totalProposals > 0 ? (count / totalProposals) * 100 : 0;
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <StatusBadge status={status as any} />
                    <span className="text-sm text-gray-900">
                      {count} propostas
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-cyan-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Clientes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Top Clientes
          </h3>
          {clientStats.length > 0 ? (
            <div className="space-y-4">
              {clientStats.map(({ client, proposalCount, totalValue }) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {client.company}
                    </p>
                    <p className="text-sm text-gray-600">
                      {proposalCount} propostas
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      R$ {totalValue.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Nenhum dado disponível
            </p>
          )}
        </div>

        {/* Top Serviços */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Serviços Mais Vendidos
          </h3>
          {serviceStats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Serviço
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Categoria
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Quantidade
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Receita
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {serviceStats.map(({ service, usage, revenue }) => (
                    <tr key={service.id}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">
                            {service.name}
                          </p>
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {service.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {service.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900">
                        {usage}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                        R$ {revenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Nenhum dado disponível
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
