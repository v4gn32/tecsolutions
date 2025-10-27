import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult, param } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Validações para usuários do sistema
const userValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('role').isIn(['admin', 'user']).withMessage('Papel deve ser admin ou user'),
  body('password').optional().isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres')
];

// Validações para usuários de clientes
const clientUserValidation = [
  body('clientId').isUUID().withMessage('ID do cliente inválido'),
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('phone').optional().notEmpty().withMessage('Telefone não pode estar vazio'),
  body('department').optional().notEmpty().withMessage('Departamento não pode estar vazio'),
  body('position').optional().notEmpty().withMessage('Cargo não pode estar vazio'),
  body('isActive').optional().isBoolean().withMessage('Status ativo deve ser verdadeiro ou falso')
];

const idValidation = [
  param('id').isUUID().withMessage('ID inválido')
];

// ===== SYSTEM USERS ROUTES =====

// GET /api/users/system
router.get('/system', requireAdmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { name: 'asc' }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
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

// GET /api/users/system/:id
router.get('/system/:id', [...idValidation, requireAdmin], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// POST /api/users/system
router.post('/system', [...userValidation, requireAdmin], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { password, ...userData } = req.body;

    if (!password) {
      return res.status(400).json({
        error: 'Senha é obrigatória para criar usuário'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/system/:id
router.put('/system/:id', [...idValidation, ...userValidation, requireAdmin], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { password, ...userData } = req.body;
    const updateData = { ...userData };

    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'Usuário atualizado com sucesso',
      user
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/users/system/:id/status
router.patch('/system/:id/status', [
  ...idValidation,
  body('isActive').isBoolean().withMessage('Status ativo deve ser verdadeiro ou falso'),
  requireAdmin
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    // Não permitir desativar o próprio usuário
    if (req.params.id === req.user.id && !req.body.isActive) {
      return res.status(400).json({
        error: 'Não é possível desativar seu próprio usuário'
      });
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: req.body.isActive },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    });

    res.json({
      message: `Usuário ${req.body.isActive ? 'ativado' : 'desativado'} com sucesso`,
      user
    });
  } catch (error) {
    next(error);
  }
});

// ===== CLIENT USERS ROUTES =====

// GET /api/users/clients
router.get('/clients', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, clientId, isActive } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (clientId) {
      where.clientId = clientId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const [clientUsers, total] = await Promise.all([
      prisma.clientUser.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          client: {
            select: { id: true, name: true, company: true }
          }
        },
        orderBy: { name: 'asc' }
      }),
      prisma.clientUser.count({ where })
    ]);

    res.json({
      clientUsers,
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

// GET /api/users/clients/:id
router.get('/clients/:id', idValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const clientUser = await prisma.clientUser.findUnique({
      where: { id: req.params.id },
      include: {
        client: true
      }
    });

    if (!clientUser) {
      return res.status(404).json({
        error: 'Usuário do cliente não encontrado'
      });
    }

    res.json({ clientUser });
  } catch (error) {
    next(error);
  }
});

// POST /api/users/clients
router.post('/clients', clientUserValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const clientUser = await prisma.clientUser.create({
      data: req.body,
      include: {
        client: true
      }
    });

    res.status(201).json({
      message: 'Usuário do cliente criado com sucesso',
      clientUser
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/clients/:id
router.put('/clients/:id', [...idValidation, ...clientUserValidation], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const clientUser = await prisma.clientUser.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        client: true
      }
    });

    res.json({
      message: 'Usuário do cliente atualizado com sucesso',
      clientUser
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/users/clients/:id/status
router.patch('/clients/:id/status', [
  ...idValidation,
  body('isActive').isBoolean().withMessage('Status ativo deve ser verdadeiro ou falso')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const clientUser = await prisma.clientUser.update({
      where: { id: req.params.id },
      data: { isActive: req.body.isActive },
      include: {
        client: {
          select: { id: true, name: true, company: true }
        }
      }
    });

    res.json({
      message: `Usuário do cliente ${req.body.isActive ? 'ativado' : 'desativado'} com sucesso`,
      clientUser
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/users/clients/:id
router.delete('/clients/:id', idValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    await prisma.clientUser.delete({
      where: { id: req.params.id }
    });

    res.json({
      message: 'Usuário do cliente excluído com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

export default router;