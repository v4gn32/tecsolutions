// src/routes/clients.routes.js
// => Rotas de clientes, protegidas para técnicos e admins
import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { listClients, getClient, createClient, updateClient, deleteClient } from '../controllers/clients.controller.js';

const router = Router();
router.use(authenticate);

router.get('/', listClients);
router.get('/:id', getClient);
router.post('/', createClient);
router.patch('/:id', updateClient);
router.delete('/:id', deleteClient);

export default router;
