// src/routes/products.routes.js
import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { listProducts, createProduct, updateProduct, deleteProduct } from '../controllers/products.controller.js';

const router = Router();
router.use(authenticate);

router.get('/', listProducts);
router.post('/', createProduct);
router.patch('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
