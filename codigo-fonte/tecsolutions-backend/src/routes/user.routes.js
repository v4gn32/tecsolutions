// src/routes/user.routes.js
import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { listUsers, createUser, updateUser, deleteUser } from '../controllers/user.controller.js';

const router = Router();

// Todas as rotas abaixo exigem ADMIN
router.use(authenticate, requireRole('ADMIN'));

router.get('/', listUsers);          // GET /api/users
router.post('/', createUser);        // POST /api/users
router.put('/:id', updateUser);      // PUT /api/users/:id
router.delete('/:id', deleteUser);   // DELETE /api/users/:id

export default router;
