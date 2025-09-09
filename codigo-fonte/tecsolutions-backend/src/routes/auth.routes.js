// src/routes/auth.routes.js
// Rotas de autenticação
import { Router } from 'express';
import { login, getProfile } from '../controllers/auth.controller.js';
import auth from '../middlewares/auth.middleware.js'; // <- default

const router = Router();

// Login público
router.post('/login', login);

// Perfil protegido
router.get('/profile', auth, getProfile);

export default router;
