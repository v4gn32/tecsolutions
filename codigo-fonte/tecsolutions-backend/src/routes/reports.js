const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();
const prisma = new PrismaClient();

// Middleware de autenticação para todas as rotas
router.use(auth);

/**
 * @route GET /api/reports/clients
 * @desc Relatório de clientes
 * @access Private
 */
router.get('/clients', async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    
    let whereClause = {};
    
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }
    
    if (type && type !== 'all') {
      whereClause.type = type;
    }

    const clients = await prisma.client.findMany({
      where: whereClause,
      include: {
        proposals: {
          select: {
            id: true,
            total: true,
            status: true,
            createdAt: true
          }
        },
        hardwareInventory: {
          select: {
            id: true,
            brand: true,
            model: true
          }
        },
        softwareInventory: {
          select: {
            id: true,
            softwareName: true,
            monthlyValue: true,
            annualValue: true
          }
        },
        serviceRecords: {
          select: {
            id: true,
            type: true,
            date: true,
            totalHours: true,
            cost: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calcular estatísticas
    const stats = {
      totalClients: clients.length,
      contractClients: clients.filter(c => c.type === 'contrato').length,
      casualClients: clients.filter(c => c.type === 'avulso').length,
      totalRevenue: clients.reduce((sum, client) => {
        const proposalRevenue = client.proposals
          .filter(p => p.status === 'aprovada')
          .reduce((pSum, p) => pSum + p.total, 0);
        const serviceRevenue = client.serviceRecords
          .reduce((sSum, s) => sSum + (s.cost || 0), 0);
        return sum + proposalRevenue + serviceRevenue;
      }, 0),
      totalHardware: clients.reduce((sum, client) => sum + client.hardwareInventory.length, 0),
      totalSoftware: clients.reduce((sum, client) => sum + client.softwareInventory.length, 0)
    };

    res.json({
      success: true,
      data: {
        clients,
        stats
      }
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route GET /api/reports/services
 * @desc Relatório de atendimentos
 * @access Private
 */
router.get('/services', async (req, res) => {
  try {
    const { startDate, endDate, type, clientId } = req.query;
    
    let whereClause = {};
    
    if (startDate && endDate) {
      whereClause.date = {
        gte: startDate,
        lte: endDate
      };
    }
    
    if (type && type !== 'all') {
      whereClause.type = type;
    }
    
    if (clientId) {
      whereClause.clientId = clientId;
    }

    const serviceRecords = await prisma.serviceRecord.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    // Calcular estatísticas
    const stats = {
      totalServices: serviceRecords.length,
      remoteServices: serviceRecords.filter(s => s.type === 'remote').length,
      onsiteServices: serviceRecords.filter(s => s.type === 'onsite').length,
      laboratoryServices: serviceRecords.filter(s => s.type === 'laboratory').length,
      thirdPartyServices: serviceRecords.filter(s => s.type === 'third_party').length,
      totalHours: serviceRecords.reduce((sum, s) => sum + (s.totalHours || 0), 0),
      totalRevenue: serviceRecords.reduce((sum, s) => sum + (s.cost || 0), 0),
      averageServiceTime: serviceRecords.length > 0 
        ? serviceRecords.reduce((sum, s) => sum + (s.totalHours || 0), 0) / serviceRecords.length 
        : 0
    };

    res.json({
      success: true,
      data: {
        serviceRecords,
        stats
      }
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de atendimentos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route GET /api/reports/financial
 * @desc Relatório financeiro
 * @access Private
 */
router.get('/financial', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    // Buscar propostas aprovadas
    const proposals = await prisma.proposal.findMany({
      where: {
        status: 'aprovada',
        ...(startDate && endDate && { createdAt: dateFilter })
      },
      include: {
        client: {
          select: {
            name: true,
            company: true
          }
        }
      }
    });

    // Buscar atendimentos com custo
    const serviceRecords = await prisma.serviceRecord.findMany({
      where: {
        cost: {
          not: null
        },
        ...(startDate && endDate && { date: {
          gte: startDate,
          lte: endDate
        }})
      },
      include: {
        client: {
          select: {
            name: true,
            company: true
          }
        }
      }
    });

    // Calcular receitas
    const proposalRevenue = proposals.reduce((sum, p) => sum + p.total, 0);
    const serviceRevenue = serviceRecords.reduce((sum, s) => sum + (s.cost || 0), 0);
    const totalRevenue = proposalRevenue + serviceRevenue;

    // Agrupar por mês
    const monthlyData = {};
    
    proposals.forEach(proposal => {
      const month = new Date(proposal.createdAt).toISOString().substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { proposals: 0, services: 0, total: 0 };
      }
      monthlyData[month].proposals += proposal.total;
      monthlyData[month].total += proposal.total;
    });

    serviceRecords.forEach(service => {
      const month = service.date.substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { proposals: 0, services: 0, total: 0 };
      }
      monthlyData[month].services += service.cost || 0;
      monthlyData[month].total += service.cost || 0;
    });

    const stats = {
      totalRevenue,
      proposalRevenue,
      serviceRevenue,
      totalProposals: proposals.length,
      totalServices: serviceRecords.length,
      averageProposalValue: proposals.length > 0 ? proposalRevenue / proposals.length : 0,
      averageServiceValue: serviceRecords.length > 0 ? serviceRevenue / serviceRecords.length : 0,
      monthlyData: Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, data]) => ({ month, ...data }))
    };

    res.json({
      success: true,
      data: {
        proposals,
        serviceRecords,
        stats
      }
    });
  } catch (error) {
    console.error('Erro ao gerar relatório financeiro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route GET /api/reports/inventory
 * @desc Relatório de inventário
 * @access Private
 */
router.get('/inventory', async (req, res) => {
  try {
    const { clientId, type } = req.query;
    
    let whereClause = {};
    if (clientId) {
      whereClause.clientId = clientId;
    }

    const data = {};

    if (!type || type === 'hardware') {
      data.hardware = await prisma.hardwareInventory.findMany({
        where: whereClause,
        include: {
          client: {
            select: {
              name: true,
              company: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    }

    if (!type || type === 'software') {
      data.software = await prisma.softwareInventory.findMany({
        where: whereClause,
        include: {
          client: {
            select: {
              name: true,
              company: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    }

    // Calcular estatísticas
    const stats = {
      totalHardware: data.hardware ? data.hardware.length : 0,
      totalSoftware: data.software ? data.software.length : 0,
      hardwareByBrand: data.hardware ? 
        data.hardware.reduce((acc, item) => {
          acc[item.brand] = (acc[item.brand] || 0) + 1;
          return acc;
        }, {}) : {},
      softwareByType: data.software ?
        data.software.reduce((acc, item) => {
          acc[item.softwareType] = (acc[item.softwareType] || 0) + 1;
          return acc;
        }, {}) : {},
      monthlySoftwareCosts: data.software ?
        data.software.reduce((sum, item) => sum + (item.monthlyValue || 0), 0) : 0,
      annualSoftwareCosts: data.software ?
        data.software.reduce((sum, item) => sum + (item.annualValue || 0), 0) : 0
    };

    res.json({
      success: true,
      data: {
        ...data,
        stats
      }
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de inventário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;