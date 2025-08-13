// src/routes/products.routes.js
import { Router } from 'express';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/products.controller.js';

import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', authenticate, getProducts);
router.post('/', authenticate, createProduct);
router.put('/:id', authenticate, updateProduct);
router.delete('/:id', authenticate, deleteProduct);

export default router;
