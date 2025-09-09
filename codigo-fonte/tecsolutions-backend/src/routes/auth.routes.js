// src/routes/auth.routes.js
import { Router } from 'express';
import { register, login, getProfile } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// Registro e login
router.post('/register', register); // POST /api/auth/register
router.post('/login', login);       // POST /api/auth/login

// Perfil do usuário autenticado
router.get('/profile', authenticate, getProfile); // GET /api/auth/profile

export default router;
