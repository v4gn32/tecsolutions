import { Router } from "express";
import { createUser, getUsers } from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";

const router = Router();

// Somente admin pode criar usuários
router.post("/", authenticate, isAdmin, createUser);

// Listar usuários (somente admin)
router.get("/", authenticate, isAdmin, getUsers);

export default router;
