import express from 'express';
import { body, validationResult, param } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Validações para Hardware
const hardwareValidation = [
  body('clientId').isUUID().withMessage('ID do cliente inválido'),
  body('brand').notEmpty().withMessage('Marca é obrigatória'),
  body('model').notEmpty().withMessage('Modelo é obrigatório'),
  body('serialNumber').notEmpty().withMessage('Número de série é obrigatório'),
  body('processor').notEmpty().withMessage('Processador é obrigatório'),
  body('memory').notEmpty().withMessage('Memória é obrigatória'),
  body('storage').notEmpty().withMessage('Armazenamento é obrigatório'),
  body('operatingSystem').notEmpty().withMessage('Sistema operacional é obrigatório'),
  body('deviceName').notEmpty().withMessage('Nome do dispositivo é obrigatório'),
  body('office').notEmpty().withMessage('Escritório é obrigatório'),
  body('antivirus').notEmpty().withMessage('Antivírus é obrigatório'),
  body('username').notEmpty().withMessage('Nome de usuário é obrigatório'),
  body('password').notEmpty().withMessage('Senha é obrigatória'),
  body('pin').notEmpty().withMessage('PIN é obrigatório'),
  body('warranty').notEmpty().withMessage('Garantia é obrigatória')
];

// Validações para Software
const softwareValidation = [
  body('clientId').isUUID().withMessage('ID do cliente inválido'),
  body('login').notEmpty().withMessage('Login é obrigatório'),
  body('password').notEmpty().withMessage('Senha é obrigatória'),
  body('softwareName').notEmpty().withMessage('Nome do software é obrigatório'),
  body('softwareType').isIn(['local', 'cloud', 'subscription', 'license', 'outros']).withMessage('Tipo de software inválido'),
  body('expirationAlert').isISO8601().withMessage('Data de alerta de expiração inválida'),
  body('userControl').isIn(['ad_local', 'cloud', 'none']).withMessage('Controle de usuário inválido'),
  body('monthlyValue').optional().isFloat({ min: 0 }).withMessage('Valor mensal deve ser um número positivo'),
  body('annualValue').optional().isFloat({ min: 0 }).withMessage('Valor anual deve ser um número positivo')
];

const idValidation = [
  param('id').isUUID().withMessage('ID inválido')
];

// ===== HARDWARE ROUTES =====

// GET /api/inventory/hardware
router.get('/hardware', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, clientId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    
    if (search) {
      where.OR = [
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { serialNumber: { contains: search, mode: 'insensitive' } },
        { deviceName: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (clientId) {
      where.clientId = clientId;
    }

    const [hardware, total] = await Promise.all([
      prisma.hardwareInventory.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          client: {
            select: { id: true, name: true, company: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.hardwareInventory.count({ where })
    ]);

    res.json({
      hardware,
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

// GET /api/inventory/hardware/:id
router.get('/hardware/:id', idValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const hardware = await prisma.hardwareInventory.findUnique({
      where: { id: req.params.id },
      include: {
        client: true
      }
    });

    if (!hardware) {
      return res.status(404).json({
        error: 'Hardware não encontrado'
      });
    }

    res.json({ hardware });
  } catch (error) {
    next(error);
  }
});

// POST /api/inventory/hardware
router.post('/hardware', hardwareValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const hardware = await prisma.hardwareInventory.create({
      data: req.body,
      include: {
        client: true
      }
    });

    res.status(201).json({
      message: 'Hardware criado com sucesso',
      hardware
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/inventory/hardware/:id
router.put('/hardware/:id', [...idValidation, ...hardwareValidation], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const hardware = await prisma.hardwareInventory.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        client: true
      }
    });

    res.json({
      message: 'Hardware atualizado com sucesso',
      hardware
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/inventory/hardware/:id
router.delete('/hardware/:id', idValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    await prisma.hardwareInventory.delete({
      where: { id: req.params.id }
    });

    res.json({
      message: 'Hardware excluído com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

// ===== SOFTWARE ROUTES =====

// GET /api/inventory/software
router.get('/software', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, clientId, expiringSoon } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    
    if (search) {
      where.OR = [
        { softwareName: { contains: search, mode: 'insensitive' } },
        { login: { contains: search, mode: 'insensitive' } },
        { softwareType: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (clientId) {
      where.clientId = clientId;
    }

    if (expiringSoon === 'true') {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      where.expirationAlert = { lte: thirtyDaysFromNow };
    }

    const [software, total] = await Promise.all([
      prisma.softwareInventory.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          client: {
            select: { id: true, name: true, company: true }
          }
        },
        orderBy: { expirationAlert: 'asc' }
      }),
      prisma.softwareInventory.count({ where })
    ]);

    res.json({
      software,
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

// GET /api/inventory/software/:id
router.get('/software/:id', idValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const software = await prisma.softwareInventory.findUnique({
      where: { id: req.params.id },
      include: {
        client: true
      }
    });

    if (!software) {
      return res.status(404).json({
        error: 'Software não encontrado'
      });
    }

    res.json({ software });
  } catch (error) {
    next(error);
  }
});

// POST /api/inventory/software
router.post('/software', softwareValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const software = await prisma.softwareInventory.create({
      data: req.body,
      include: {
        client: true
      }
    });

    res.status(201).json({
      message: 'Software criado com sucesso',
      software
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/inventory/software/:id
router.put('/software/:id', [...idValidation, ...softwareValidation], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const software = await prisma.softwareInventory.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        client: true
      }
    });

    res.json({
      message: 'Software atualizado com sucesso',
      software
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/inventory/software/:id
router.delete('/software/:id', idValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    await prisma.softwareInventory.delete({
      where: { id: req.params.id }
    });

    res.json({
      message: 'Software excluído com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

export default router;