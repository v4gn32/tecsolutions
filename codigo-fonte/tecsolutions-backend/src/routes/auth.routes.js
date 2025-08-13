import { Router } from 'express';
import { login, register, profile } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/profile', authenticate, profile);

export default router;
