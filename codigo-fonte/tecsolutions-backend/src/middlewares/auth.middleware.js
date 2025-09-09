// src/middlewares/auth.middleware.js
// Verifica o JWT e injeta req.user
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Token não fornecido" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Usuário inválido ou inativo" });
    }

    req.user = {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido" });
  }
}
