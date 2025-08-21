import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  FileText,
  Calendar,
  Download,
} from "lucide-react";
import { getProposals, getClients, getServices } from "../utils/storage";
import { Proposal, Client, Service } from "../types";
import StatusBadge from "../components/StatusBadge";

const Reports: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [p, c, s] = await Promise.all([
          getProposals(),
          getClients(),
          getServices(),
        ]);
        setProposals(Array.isArray(p) ? p : []);
        setClients(Array.isArray(c) ? c : []);
        setServices(Array.isArray(s) ? s : []);
      } catch (err) {
        console.error(err);
        setError("Falha ao carregar relatórios.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return <div className="p-6 text-gray-500">Carregando relatórios…</div>;
  }
  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  // --- filtros e cálculos permanecem idênticos ---
  const filteredProposals = proposals.filter((proposal) => {
    const proposalDate = new Date(proposal.createdAt);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    return proposalDate >= startDate && proposalDate <= endDate;
  });

  const totalProposals = filteredProposals.length;
  const approvedProposals = filteredProposals.filter(
    (p) => p.status === "aprovada"
  );
  const totalRevenue = approvedProposals.reduce((sum, p) => sum + p.total, 0);
  const conversionRate =
    totalProposals > 0 ? (approvedProposals.length / totalProposals) * 100 : 0;
  const averageValue =
    approvedProposals.length > 0 ? totalRevenue / approvedProposals.length : 0;

  const statusStats = [
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
  ];

  const clientStats = clients
    .map((client) => {
      const clientProposals = filteredProposals.filter(
        (p) => p.clientId === client.id
      );
      const approvedValue = clientProposals
        .filter((p) => p.status === "aprovada")
        .reduce((sum, p) => sum + p.total, 0);

      return {
        client,
        proposalCount: clientProposals.length,
        totalValue: approvedValue,
      };
    })
    .filter((stat) => stat.proposalCount > 0)
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 5);

  const serviceStats = services
    .map((service) => {
      const serviceUsage = filteredProposals.reduce((count, proposal) => {
        const serviceItems = proposal.items.filter(
          (item) => item.serviceId === service.id
        );
        return (
          count + serviceItems.reduce((sum, item) => sum + item.quantity, 0)
        );
      }, 0);

      const serviceRevenue = filteredProposals
        .filter((p) => p.status === "aprovada")
        .reduce((sum, proposal) => {
          const serviceItems = proposal.items.filter(
            (item) => item.serviceId === service.id
          );
          return (
            sum +
            serviceItems.reduce((itemSum, item) => itemSum + item.total, 0)
          );
        }, 0);

      return { service, usage: serviceUsage, revenue: serviceRevenue };
    })
    .filter((stat) => stat.usage > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

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
      topClients: clientStats,
      topServices: serviceStats,
    };
    const dataStr = JSON.stringify(reportData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio_${dateRange.start}_${dateRange.end}.json`;
    link.click();
  };

  return <div className="space-y-6">{/* resto da UI permanece igual */}</div>;
};

export default Reports;
