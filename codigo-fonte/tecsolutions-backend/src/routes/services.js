import express from 'express';
import { body, validationResult, param } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Validações
const serviceValidation = [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('description').notEmpty().withMessage('Descrição é obrigatória'),
  body('price').isFloat({ min: 0 }).withMessage('Preço deve ser um número positivo'),
  body('category').isIn(['infraestrutura', 'helpdesk', 'nuvem', 'backup', 'cabeamento', 'outros']).withMessage('Categoria inválida'),
  body('unit').notEmpty().withMessage('Unidade é obrigatória')
];

const idValidation = [
  param('id').isUUID().withMessage('ID inválido')
];

// GET /api/services
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, category } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.category = category;
    }

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { name: 'asc' }
      }),
      prisma.service.count({ where })
    ]);

    res.json({
      services,
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

// GET /api/services/:id
router.get('/:id', idValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const service = await prisma.service.findUnique({
      where: { id: req.params.id }
    });

    if (!service) {
      return res.status(404).json({
        error: 'Serviço não encontrado'
      });
    }

    res.json({ service });
  } catch (error) {
    next(error);
  }
});

// POST /api/services
router.post('/', serviceValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const service = await prisma.service.create({
      data: req.body
    });

    res.status(201).json({
      message: 'Serviço criado com sucesso',
      service
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/services/:id
router.put('/:id', [...idValidation, ...serviceValidation], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const service = await prisma.service.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json({
      message: 'Serviço atualizado com sucesso',
      service
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/services/:id
router.delete('/:id', idValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    await prisma.service.delete({
      where: { id: req.params.id }
    });

    res.json({
      message: 'Serviço excluído com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/services/categories
router.get('/categories', async (req, res, next) => {
  try {
    const categories = [
      'infraestrutura',
      'helpdesk',
      'nuvem',
      'backup',
      'cabeamento',
      'outros'
    ];

    res.json({ categories });
  } catch (error) {
    next(error);
  }
});

export default router;