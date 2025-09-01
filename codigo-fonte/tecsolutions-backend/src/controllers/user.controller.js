// src/controllers/user.controller.js
// => CRUD de usuários (apenas ADMIN)
import prisma from '../config/db.js';
import bcrypt from 'bcryptjs';

export async function listUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true }
    });
    return res.json(users);
  } catch {
    return res.status(500).json({ message: 'Erro ao listar usuários' });
  }
}

export async function createUser(req, res) {
  try {
    const { name, email, password, role = 'TECH' } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role, isActive: true },
      select: { id: true, name: true, email: true, role: true, isActive: true }
    });
    return res.status(201).json(user);
  } catch {
    return res.status(400).json({ message: 'Erro ao criar usuário (e-mail pode já existir)' });
  }
}

export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, role, isActive } = req.body;
    const user = await prisma.user.update({
      where: { id },
      data: { name, email, role, isActive },
      select: { id: true, name: true, email: true, role: true, isActive: true }
    });
    return res.json(user);
  } catch {
    return res.status(400).json({ message: 'Erro ao atualizar usuário' });
  }
}

export async function resetPassword(req, res) {
  try {
    const { id } = req.params;
    const passwordHash = await bcrypt.hash('123456', 10);
    await prisma.user.update({ where: { id }, data: { passwordHash } });
    return res.json({ message: 'Senha redefinida para 123456' });
  } catch {
    return res.status(400).json({ message: 'Erro ao redefinir senha' });
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    return res.status(204).send();
  } catch {
    return res.status(400).json({ message: 'Erro ao excluir usuário' });
  }
}
