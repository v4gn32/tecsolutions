// src/controllers/auth.controller.js

import prisma from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

function sign(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role }, // <- role já vai no token
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

// POST /api/auth/login
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: "Usuário não encontrado" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Senha inválida" });

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token, // 🔑 O frontend precisa salvar isso
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: "Erro interno" });
  }
}


// src/controllers/auth.controller.js
export async function getProfile(req, res) {
  try {
    const id = Number(req.userId);
    if (!id)
      return res
        .status(401)
        .json({ message: "Token inválido ou usuário não identificado" });

    const me = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!me) return res.status(404).json({ message: "Usuário não encontrado" });
    if (!me.isActive)
      return res.status(403).json({ message: "Usuário inativo" });

    return res.json(me);
  } catch (e) {
    console.error("[auth.getProfile]", e);
    return res.status(500).json({ message: "Erro ao obter perfil" });
  }
}
