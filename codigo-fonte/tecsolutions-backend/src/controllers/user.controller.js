// src/controllers/user.controller.js
// CRUD básico de usuários (admin)
import prisma from '../config/db.js';
import bcrypt from 'bcryptjs';

export const listUsers = async (req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true }
  });
  res.json(users);
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, isActive } = req.body;
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ message: 'E-mail já cadastrado' });

    const passwordHash = await bcrypt.hash(password || '123456', 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: role || 'TECH', isActive: isActive ?? true }
    });
    res.status(201).json({ id: user.id });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar usuário', error: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, isActive, password } = req.body;

    const data = { name, role, isActive };
    if (password) data.passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.update({ where: { id }, data });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar usuário', error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao excluir usuário', error: err.message });
  }
};
