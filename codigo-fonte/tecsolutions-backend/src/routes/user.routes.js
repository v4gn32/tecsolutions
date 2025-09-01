// src/routes/user.routes.js
// => Rotas para gestão de usuários (ADMIN)
import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';
import { listUsers, createUser, updateUser, resetPassword, deleteUser } from '../controllers/user.controller.js';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles('ADMIN'));

router.get('/', listUsers);
router.post('/', createUser);
router.patch('/:id', updateUser);
router.patch('/:id/reset-password', resetPassword);
router.delete('/:id', deleteUser);

export default router;
