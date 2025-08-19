// src/routes/clients.routes.js
import { Router } from "express";
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
} from "../controllers/clients.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();
router.post("/", authenticate, createClient); // ➕ criar
router.get("/", authenticate, getClients); // 📄 listar
router.patch("/:id", authenticate, updateClient); // ✏️ atualizar
router.delete("/:id", authenticate, deleteClient); // 🗑️ deletar

export default router;
