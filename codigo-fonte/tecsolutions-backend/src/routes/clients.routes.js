// src/routes/clients.routes.js
import { Router } from 'express';
import {
  getClients,
  createClient,
  updateClient,
  deleteClient
} from '../controllers/clients.controller.js';

import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', authenticate, getClients);
router.post('/', authenticate, createClient);
router.put('/:id', authenticate, updateClient);
router.delete('/:id', authenticate, deleteClient);

export default router;
