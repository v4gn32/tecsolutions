// src/routes/reports.routes.js
import { Router } from 'express';
import { getReportSummary } from '../controllers/reports.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/summary', authenticate, getReportSummary);

export default router;
