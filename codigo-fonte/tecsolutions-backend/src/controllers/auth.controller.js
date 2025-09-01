// src/controllers/auth.controller.js
// => Login, (opcional) criação de usuário por admin, e profile
import prisma from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

function sign(user) {
  // Gera JWT contendo informações essenciais para o frontend
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/auth/login
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) return res.status(400).json({ message: 'Usuário/senha inválidos' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ message: 'Usuário/senha inválidos' });

    const token = sign(user);
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    return res.status(500).json({ message: 'Erro ao autenticar' });
  }
}

// GET /api/auth/profile
export async function getProfile(req, res) {
  try {
    const me = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true }
    });
    return res.json(me);
  } catch {
    return res.status(500).json({ message: 'Erro ao obter perfil' });
  }
}
