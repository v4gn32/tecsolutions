// src/routes/clients.routes.js
import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { listClients, getClient, createClient, updateClient, deleteClient } from '../controllers/clients.controller.js';

const router = Router();

// Clientes: técnicos e admins autenticados podem acessar
router.use(authenticate);

router.get('/', listClients);          // GET /api/clients
router.get('/:id', getClient);         // GET /api/clients/:id
router.post('/', createClient);        // POST /api/clients
router.put('/:id', updateClient);      // PUT /api/clients/:id
router.delete('/:id', deleteClient);   // DELETE /api/clients/:id

export default router;
