// src/routes/services.routes.js
import { Router } from 'express';
import {
  getServices,
  createService,
  updateService,
  deleteService
} from '../controllers/services.controller.js';

import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', authenticate, getServices);
router.post('/', authenticate, createService);
router.put('/:id', authenticate, updateService);
router.delete('/:id', authenticate, deleteService);

export default router;
