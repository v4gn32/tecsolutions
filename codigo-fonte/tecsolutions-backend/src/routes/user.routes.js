// src/routes/user.routes.js
// Rotas de usuários (somente ADMIN)
import { Router } from "express";
import auth from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
} from "../controllers/user.controller.js";

const router = Router();

// Todas as rotas abaixo exigem JWT + admin
router.use(auth, isAdmin);

router.get("/", listUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.patch("/:id/reset-password", resetPassword);

export default router;
