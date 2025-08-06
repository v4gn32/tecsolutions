import { Router } from 'express';
import { getClients, createClient } from '../controllers/clients.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', authenticate, getClients);
router.post('/', authenticate, createClient);

export default router;
