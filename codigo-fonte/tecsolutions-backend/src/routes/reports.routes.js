// src/routes/reports.routes.js
import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { listReports, createReport, deleteReport } from '../controllers/reports.controller.js';

const router = Router();
router.use(authenticate);

router.get('/', listReports);
router.post('/', createReport);
router.delete('/:id', deleteReport);

export default router;
