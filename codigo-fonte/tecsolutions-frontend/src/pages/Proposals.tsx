import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, Search, Filter, Mail, Edit, Trash2 } from "lucide-react";
// 🔗 API central (token em memória via interceptor)
import { api } from "../services/api";
import { Proposal, Client } from "../types";
import StatusBadge from "../components/StatusBadge";

const Proposals: React.FC = () => {
  // -------------------- Estados --------------------
  const [proposals, setProposals] = useState<Proposal[]>([]); // propostas do backend
  const [clients, setClients] = useState<Client[]>([]); // clientes (para exibir nome/empresa)
  const [searchTerm, setSearchTerm] = useState(""); // filtro texto
  const [statusFilter, setStatusFilter] = useState<string>("all"); // filtro status
  const [isLoading, setIsLoading] = useState<boolean>(false); // loading tabela
  const [error, setError] = useState<string | null>(null); // erro simples

  // -------------------- Carga inicial --------------------
  const loadData = async () => {
    // # Busca propostas e clientes (com possibilidade de filtros server-side)
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (searchTerm.trim()) params.q = searchTerm.trim(); // backend: busca por número/título/cliente
      if (statusFilter !== "all") params.status = statusFilter; // backend: filtra por status

      const [pRes, cRes] = await Promise.all([
        api.get<Proposal[]>("/proposals", { params }),
        api.get<Client[]>("/clients"),
      ]);

      setProposals(Array.isArray(pRes.data) ? pRes.data : []);
      setClients(Array.isArray(cRes.data) ? cRes.data : []);
    } catch (e: any) {
      setError("Falha ao carregar propostas. Tente novamente.");
      setProposals([]);
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter]);

  // -------------------- Fallback de filtro local --------------------
  const filteredProposals = useMemo(() => {
    const list = proposals || [];
    if (!list.length) return [];
    const term = searchTerm.toLowerCase();

    return list.filter((proposal) => {
      const client = clients.find((c) => c.id === proposal.clientId);
      const matchesSearch =
        !term ||
        proposal.number?.toLowerCase().includes(term) ||
        proposal.title?.toLowerCase().includes(term) ||
        client?.company?.toLowerCase().includes(term);
      const matchesStatus =
        statusFilter === "all" || proposal.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [proposals, clients, searchTerm, statusFilter]);

  // -------------------- Ações --------------------
  const handleDelete = async (id: string) => {
    // # Exclui proposta no backend e recarrega
    if (!window.confirm("Tem certeza que deseja excluir esta proposta?"))
      return;
    setError(null);
    try {
      await api.delete(`/proposals/${id}`);
      await loadData();
    } catch (e: any) {
      setError("Falha ao excluir a proposta. Tente novamente.");
    }
  };

  const handleSendEmail = (proposal: Proposal) => {
    // # Abre cliente de email com assunto/corpo (mailto)
    const client = clients.find((c) => c.id === proposal.clientId);
    if (!client) return;
    const subject = `Proposta Comercial - ${proposal.number}`;
    const body = `Prezado(a) ${client.name},\n\nSegue em anexo nossa proposta comercial.\n\nAtenciosamente,\nEquipe TecSolutions`;
    window.open(
      `mailto:${client.email}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`
    );
  };

  // -------------------- Render --------------------
  return (
    <div className="space-y-6">
      {/* ==================== Header ==================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Propostas</h1>
          <p className="text-gray-600">Gerencie suas propostas comerciais</p>
        </div>
        <Link
          to="/proposals/new"
          className="inline-flex items-center px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors duration-200"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Nova Proposta
        </Link>
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
                placeholder="Buscar por número, título ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>
          {/* Status */}
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="all">Todos os Status</option>
              <option value="rascunho">Rascunho</option>
              <option value="enviada">Enviada</option>
              <option value="aprovada">Aprovada</option>
              <option value="recusada">Recusada</option>
            </select>
          </div>
        </div>
      </div>

      {/* ==================== Tabela ==================== */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {isLoading ? (
          // Loading da lista
          <div className="p-6 text-sm text-gray-500">
            Carregando propostas...
          </div>
        ) : filteredProposals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proposta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProposals.map((proposal) => {
                  const client = clients.find(
                    (c) => c.id === proposal.clientId
                  );
                  return (
                    <tr key={proposal.id} className="hover:bg-gray-50">
                      {/* Número/Título */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {proposal.number}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {proposal.title}
                          </div>
                        </div>
                      </td>

                      {/* Cliente */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {client?.company || "Cliente não encontrado"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {client?.name}
                        </div>
                      </td>

                      {/* Valor */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        R$ {(Number(proposal.total) || 0).toFixed(2)}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={proposal.status as any} />
                      </td>

                      {/* Data */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {proposal.createdAt
                          ? new Date(
                              proposal.createdAt as any
                            ).toLocaleDateString("pt-BR")
                          : "—"}
                      </td>

                      {/* Ações */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleSendEmail(proposal)}
                            className="text-blue-600 hover:text-blue-500 p-1"
                            title="Enviar por email"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/proposals/${proposal.id}/edit`}
                            className="text-gray-600 hover:text-gray-500 p-1"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(proposal.id)}
                            className="text-red-600 hover:text-red-500 p-1"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          // Estado vazio
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma proposta encontrada
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== "all"
                ? "Tente ajustar os filtros de busca"
                : "Crie sua primeira proposta para começar"}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Link
                to="/proposals/new"
                className="inline-flex items-center px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors duration-200"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Criar primeira proposta
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Proposals;
