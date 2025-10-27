import express from 'express';
import { body, validationResult, param } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Validações
const productValidation = [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('description').notEmpty().withMessage('Descrição é obrigatória'),
  body('price').isFloat({ min: 0 }).withMessage('Preço deve ser um número positivo'),
  body('category').isIn(['cabos', 'conectores', 'equipamentos', 'acessorios', 'outros']).withMessage('Categoria inválida'),
  body('unit').notEmpty().withMessage('Unidade é obrigatória'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Estoque deve ser um número inteiro positivo')
];

const idValidation = [
  param('id').isUUID().withMessage('ID inválido')
];

// GET /api/products
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, category, lowStock } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.category = category;
    }

    if (lowStock === 'true') {
      where.stock = { lte: 10 };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { name: 'asc' }
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      products,
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

// GET /api/products/:id
router.get('/:id', idValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: req.params.id }
    });

    if (!product) {
      return res.status(404).json({
        error: 'Produto não encontrado'
      });
    }

    res.json({ product });
  } catch (error) {
    next(error);
  }
});

// POST /api/products
router.post('/', productValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const product = await prisma.product.create({
      data: req.body
    });

    res.status(201).json({
      message: 'Produto criado com sucesso',
      product
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/products/:id
router.put('/:id', [...idValidation, ...productValidation], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json({
      message: 'Produto atualizado com sucesso',
      product
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/products/:id
router.delete('/:id', idValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    await prisma.product.delete({
      where: { id: req.params.id }
    });

    res.json({
      message: 'Produto excluído com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/products/:id/stock
router.patch('/:id/stock', [
  ...idValidation,
  body('quantity').isInt().withMessage('Quantidade deve ser um número inteiro'),
  body('operation').isIn(['add', 'subtract', 'set']).withMessage('Operação deve ser add, subtract ou set')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { quantity, operation } = req.body;
    const product = await prisma.product.findUnique({
      where: { id: req.params.id }
    });

    if (!product) {
      return res.status(404).json({
        error: 'Produto não encontrado'
      });
    }

    let newStock = product.stock || 0;

    switch (operation) {
      case 'add':
        newStock += quantity;
        break;
      case 'subtract':
        newStock = Math.max(0, newStock - quantity);
        break;
      case 'set':
        newStock = Math.max(0, quantity);
        break;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: req.params.id },
      data: { stock: newStock }
    });

    res.json({
      message: 'Estoque atualizado com sucesso',
      product: updatedProduct
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/categories
router.get('/categories', async (req, res, next) => {
  try {
    const categories = [
      'cabos',
      'conectores',
      'equipamentos',
      'acessorios',
      'outros'
    ];

    res.json({ categories });
  } catch (error) {
    next(error);
  }
});

export default router;