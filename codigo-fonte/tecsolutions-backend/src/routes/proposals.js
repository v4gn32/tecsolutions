import express from 'express';
import { body, validationResult, param } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Validações
const proposalValidation = [
  body('clientId').isUUID().withMessage('ID do cliente inválido'),
  body('title').notEmpty().withMessage('Título é obrigatório'),
  body('description').notEmpty().withMessage('Descrição é obrigatória'),
  body('items').isArray({ min: 1 }).withMessage('Deve ter pelo menos um item de serviço'),
  body('items.*.serviceId').isUUID().withMessage('ID do serviço inválido'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantidade deve ser um número inteiro positivo'),
  body('items.*.unitPrice').isFloat({ min: 0 }).withMessage('Preço unitário deve ser um número positivo'),
  body('productItems').optional().isArray().withMessage('Itens de produto deve ser um array'),
  body('productItems.*.productId').optional().isUUID().withMessage('ID do produto inválido'),
  body('productItems.*.quantity').optional().isInt({ min: 1 }).withMessage('Quantidade deve ser um número inteiro positivo'),
  body('productItems.*.unitPrice').optional().isFloat({ min: 0 }).withMessage('Preço unitário deve ser um número positivo'),
  body('discount').optional().isFloat({ min: 0 }).withMessage('Desconto deve ser um número positivo'),
  body('validUntil').isISO8601().withMessage('Data de validade inválida'),
  body('status').optional().isIn(['rascunho', 'enviada', 'aprovada', 'recusada']).withMessage('Status inválido')
];

const idValidation = [
  param('id').isUUID().withMessage('ID inválido')
];

// Função para gerar número da proposta
async function generateProposalNumber() {
  const year = new Date().getFullYear();
  const count = await prisma.proposal.count({
    where: {
      createdAt: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`)
      }
    }
  });
  
  return `PROP-${year}-${String(count + 1).padStart(4, '0')}`;
}

// GET /api/proposals
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status, clientId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    
    if (search) {
      where.OR = [
        { number: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { client: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    const [proposals, total] = await Promise.all([
      prisma.proposal.findMany({
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
      prisma.proposal.count({ where })
    ]);

    res.json({
      proposals,
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

// GET /api/proposals/:id
router.get('/:id', idValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const proposal = await prisma.proposal.findUnique({
      where: { id: req.params.id },
      include: {
        client: true,
        items: {
          include: {
            service: true
          }
        },
        productItems: {
          include: {
            product: true
          }
        }
      }
    });

    if (!proposal) {
      return res.status(404).json({
        error: 'Proposta não encontrada'
      });
    }

    res.json({ proposal });
  } catch (error) {
    next(error);
  }
});

// POST /api/proposals
router.post('/', proposalValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { items, productItems = [], ...proposalData } = req.body;

    // Calcular totais
    let subtotal = 0;
    
    // Calcular total dos serviços
    for (const item of items) {
      item.total = item.quantity * item.unitPrice;
      subtotal += item.total;
    }

    // Calcular total dos produtos
    for (const item of productItems) {
      item.total = item.quantity * item.unitPrice;
      subtotal += item.total;
    }

    const discount = proposalData.discount || 0;
    const total = subtotal - discount;

    // Gerar número da proposta
    const number = await generateProposalNumber();

    const proposal = await prisma.proposal.create({
      data: {
        ...proposalData,
        number,
        subtotal,
        total,
        items: {
          create: items
        },
        productItems: {
          create: productItems
        }
      },
      include: {
        client: true,
        items: {
          include: {
            service: true
          }
        },
        productItems: {
          include: {
            product: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Proposta criada com sucesso',
      proposal
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/proposals/:id
router.put('/:id', [...idValidation, ...proposalValidation], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { items, productItems = [], ...proposalData } = req.body;

    // Calcular totais
    let subtotal = 0;
    
    // Calcular total dos serviços
    for (const item of items) {
      item.total = item.quantity * item.unitPrice;
      subtotal += item.total;
    }

    // Calcular total dos produtos
    for (const item of productItems) {
      item.total = item.quantity * item.unitPrice;
      subtotal += item.total;
    }

    const discount = proposalData.discount || 0;
    const total = subtotal - discount;

    const proposal = await prisma.proposal.update({
      where: { id: req.params.id },
      data: {
        ...proposalData,
        subtotal,
        total,
        items: {
          deleteMany: {},
          create: items
        },
        productItems: {
          deleteMany: {},
          create: productItems
        }
      },
      include: {
        client: true,
        items: {
          include: {
            service: true
          }
        },
        productItems: {
          include: {
            product: true
          }
        }
      }
    });

    res.json({
      message: 'Proposta atualizada com sucesso',
      proposal
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/proposals/:id/status
router.patch('/:id/status', [
  ...idValidation,
  body('status').isIn(['rascunho', 'enviada', 'aprovada', 'recusada']).withMessage('Status inválido')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const proposal = await prisma.proposal.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
      include: {
        client: true
      }
    });

    res.json({
      message: 'Status da proposta atualizado com sucesso',
      proposal
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/proposals/:id
router.delete('/:id', idValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    await prisma.proposal.delete({
      where: { id: req.params.id }
    });

    res.json({
      message: 'Proposta excluída com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

export default router;