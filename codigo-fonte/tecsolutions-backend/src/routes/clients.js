import express from 'express';
import { body, validationResult, param } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Validações
const clientValidation = [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('phone').notEmpty().withMessage('Telefone é obrigatório'),
  body('company').notEmpty().withMessage('Empresa é obrigatória'),
  body('cnpj').optional().isLength({ min: 14, max: 18 }).withMessage('CNPJ inválido'),
  body('street').notEmpty().withMessage('Rua é obrigatória'),
  body('number').notEmpty().withMessage('Número é obrigatório'),
  body('neighborhood').notEmpty().withMessage('Bairro é obrigatório'),
  body('city').notEmpty().withMessage('Cidade é obrigatória'),
  body('state').notEmpty().withMessage('Estado é obrigatório'),
  body('zipCode').notEmpty().withMessage('CEP é obrigatório'),
  body('type').isIn(['contrato', 'avulso']).withMessage('Tipo deve ser contrato ou avulso')
];

const idValidation = [
  param('id').isUUID().withMessage('ID inválido')
];

// GET /api/clients
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (type) {
      where.type = type;
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { name: 'asc' }
      }),
      prisma.client.count({ where })
    ]);

    res.json({
      clients,
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

// GET /api/clients/:id
router.get('/:id', idValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const client = await prisma.client.findUnique({
      where: { id: req.params.id },
      include: {
        proposals: true,
        hardwareInventory: true,
        softwareInventory: true,
        serviceRecords: true,
        clientUsers: true
      }
    });

    if (!client) {
      return res.status(404).json({
        error: 'Cliente não encontrado'
      });
    }

    res.json(client);
  } catch (error) {
    next(error);
  }
});

// POST /api/clients
router.post('/', clientValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const client = await prisma.client.create({
      data: req.body
    });

    res.status(201).json(client);
  } catch (error) {
    next(error);
  }
});

// PUT /api/clients/:id
router.put('/:id', [...idValidation, ...clientValidation], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const client = await prisma.client.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json(client);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/clients/:id
router.delete('/:id', idValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    await prisma.client.delete({
      where: { id: req.params.id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
