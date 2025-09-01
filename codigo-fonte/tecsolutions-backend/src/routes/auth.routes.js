// src/routes/auth.routes.js
// => Define as rotas de autenticação
import { Router } from 'express';
import { login, getProfile } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/login', login);
router.get('/profile', authenticate, getProfile);

export default router;
