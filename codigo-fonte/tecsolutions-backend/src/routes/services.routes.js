// src/routes/services.routes.js
import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { listServices, createService, updateService, deleteService } from '../controllers/services.controller.js';

const router = Router();
router.use(authenticate);

router.get('/', listServices);
router.post('/', createService);
router.patch('/:id', updateService);
router.delete('/:id', deleteService);

export default router;
