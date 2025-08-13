// src/controllers/reports.controller.js
import prisma from '../config/db.js';

// Gerar resumo de relatórios (propostas, conversão, receita, top clientes, etc)
export const getReportSummary = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const proposals = await prisma.proposal.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end
        }
      },
      include: {
        client: true,
        items: true,
        productItems: true
      }
    });

    const totalProposals = proposals.length;
    const approved = proposals.filter(p => p.status === 'APROVADA');
    const totalRevenue = approved.reduce((acc, p) => acc + p.total, 0);
    const averageValue = approved.length > 0 ? totalRevenue / approved.length : 0;
    const conversionRate = totalProposals > 0 ? (approved.length / totalProposals) * 100 : 0;

    // Status Distribution
    const statusDistribution = ['RASCUNHO', 'ENVIADA', 'APROVADA', 'RECUSADA'].map(status => ({
      status,
      count: proposals.filter(p => p.status === status).length
    }));

    // Top clients
    const clientStats = {};
    for (const p of approved) {
      const id = p.clientId;
      if (!clientStats[id]) {
        clientStats[id] = {
          client: p.client,
          total: 0,
          count: 0
        };
      }
      clientStats[id].total += p.total;
      clientStats[id].count += 1;
    }

    const topClients = Object.values(clientStats)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    res.json({
      totalProposals,
      totalRevenue,
      conversionRate,
      averageValue,
      statusDistribution,
      topClients
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao gerar relatório', details: err.message });
  }
};
