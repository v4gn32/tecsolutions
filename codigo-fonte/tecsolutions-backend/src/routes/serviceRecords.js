import express from 'express';
import { body, validationResult, param } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Validações
const serviceRecordValidation = [
  body('clientId').isUUID().withMessage('ID do cliente inválido'),
  body('type').isIn(['remote', 'onsite', 'laboratory', 'third_party']).withMessage('Tipo de serviço inválido'),
  body('date').isISO8601().withMessage('Data inválida'),
  body('description').notEmpty().withMessage('Descrição é obrigatória'),
  body('services').isArray({ min: 1 }).withMessage('Deve ter pelo menos um serviço'),
  
  // Validações condicionais para atendimento remoto/presencial
  body('arrivalTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Horário de chegada inválido'),
  body('departureTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Horário de saída inválido'),
  body('lunchBreak').optional().isBoolean().withMessage('Pausa para almoço deve ser verdadeiro ou falso'),
  body('totalHours').optional().isFloat({ min: 0 }).withMessage('Total de horas deve ser um número positivo'),
  
  // Validações para laboratório
  body('deviceReceived').optional().isISO8601().withMessage('Data de recebimento do dispositivo inválida'),
  body('deviceReturned').optional().isISO8601().withMessage('Data de devolução do dispositivo inválida'),
  body('labServices').optional().isArray().withMessage('Serviços do laboratório deve ser um array'),
  
  // Validações para terceiros
  body('thirdPartyCompany').optional().notEmpty().withMessage('Empresa terceirizada é obrigatória para tipo third_party'),
  body('sentDate').optional().isISO8601().withMessage('Data de envio inválida'),
  body('returnedDate').optional().isISO8601().withMessage('Data de retorno inválida'),
  body('cost').optional().isFloat({ min: 0 }).withMessage('Custo deve ser um número positivo')
];

const idValidation = [
  param('id').isUUID().withMessage('ID inválido')
];

// GET /api/service-records
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, type, clientId, startDate, endDate } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    
    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { client: { name: { contains: search, mode: 'insensitive' } } },
        { client: { company: { contains: search, mode: 'insensitive' } } }
      ];
    }

    if (type) {
      where.type = type;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    } else if (startDate) {
      where.date = { gte: new Date(startDate) };
    } else if (endDate) {
      where.date = { lte: new Date(endDate) };
    }

    const [serviceRecords, total] = await Promise.all([
      prisma.serviceRecord.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          client: {
            select: { id: true, name: true, company: true }
          },
          user: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { date: 'desc' }
      }),
      prisma.serviceRecord.count({ where })
    ]);

    res.json({
      serviceRecords,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/service-records/:id
router.get('/:id', idValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const serviceRecord = await prisma.serviceRecord.findUnique({
      where: { id: req.params.id },
      include: {
        client: true,
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!serviceRecord) {
      return res.status(404).json({
        error: 'Registro de serviço não encontrado'
      });
    }

    res.json({ serviceRecord });
  } catch (error) {
    next(error);
  }
});

// POST /api/service-records
router.post('/', serviceRecordValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    // Calcular total de horas para atendimento remoto/presencial
    let totalHours = req.body.totalHours;
    if (req.body.type === 'remote' || req.body.type === 'onsite') {
      if (req.body.arrivalTime && req.body.departureTime) {
        const arrival = new Date(`2000-01-01T${req.body.arrivalTime}:00`);
        const departure = new Date(`2000-01-01T${req.body.departureTime}:00`);
        let hours = (departure - arrival) / (1000 * 60 * 60);
        
        // Subtrair 1 hora se teve pausa para almoço
        if (req.body.lunchBreak) {
          hours -= 1;
        }
        
        totalHours = Math.max(0, hours);
      }
    }

    const serviceRecord = await prisma.serviceRecord.create({
      data: {
        ...req.body,
        totalHours,
        createdBy: req.user.id
      },
      include: {
        client: true,
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json({
      message: 'Registro de serviço criado com sucesso',
      serviceRecord
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/service-records/:id
router.put('/:id', [...idValidation, ...serviceRecordValidation], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    // Calcular total de horas para atendimento remoto/presencial
    let totalHours = req.body.totalHours;
    if (req.body.type === 'remote' || req.body.type === 'onsite') {
      if (req.body.arrivalTime && req.body.departureTime) {
        const arrival = new Date(`2000-01-01T${req.body.arrivalTime}:00`);
        const departure = new Date(`2000-01-01T${req.body.departureTime}:00`);
        let hours = (departure - arrival) / (1000 * 60 * 60);
        
        // Subtrair 1 hora se teve pausa para almoço
        if (req.body.lunchBreak) {
          hours -= 1;
        }
        
        totalHours = Math.max(0, hours);
      }
    }

    const serviceRecord = await prisma.serviceRecord.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        totalHours
      },
      include: {
        client: true,
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json({
      message: 'Registro de serviço atualizado com sucesso',
      serviceRecord
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/service-records/:id
router.delete('/:id', idValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    await prisma.serviceRecord.delete({
      where: { id: req.params.id }
    });

    res.json({
      message: 'Registro de serviço excluído com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/service-records/stats/summary
router.get('/stats/summary', async (req, res, next) => {
  try {
    const { startDate, endDate, clientId } = req.query;
    
    const where = {};
    
    if (clientId) {
      where.clientId = clientId;
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const [
      totalRecords,
      remoteRecords,
      onsiteRecords,
      labRecords,
      thirdPartyRecords,
      totalHours,
      totalCosts
    ] = await Promise.all([
      prisma.serviceRecord.count({ where }),
      prisma.serviceRecord.count({ where: { ...where, type: 'remote' } }),
      prisma.serviceRecord.count({ where: { ...where, type: 'onsite' } }),
      prisma.serviceRecord.count({ where: { ...where, type: 'laboratory' } }),
      prisma.serviceRecord.count({ where: { ...where, type: 'third_party' } }),
      prisma.serviceRecord.aggregate({
        where: { ...where, totalHours: { not: null } },
        _sum: { totalHours: true }
      }),
      prisma.serviceRecord.aggregate({
        where: { ...where, cost: { not: null } },
        _sum: { cost: true }
      })
    ]);

    res.json({
      summary: {
        totalRecords,
        byType: {
          remote: remoteRecords,
          onsite: onsiteRecords,
          laboratory: labRecords,
          third_party: thirdPartyRecords
        },
        totalHours: totalHours._sum.totalHours || 0,
        totalCosts: totalCosts._sum.cost || 0
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;