// src/routes/proposals.routes.js
import { Router } from 'express';
import {
  getProposals,
  createProposal,
  deleteProposal
} from '../controllers/proposals.controller.js';

import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', authenticate, getProposals);
router.post('/', authenticate, createProposal);
router.delete('/:id', authenticate, deleteProposal);

export default router;
