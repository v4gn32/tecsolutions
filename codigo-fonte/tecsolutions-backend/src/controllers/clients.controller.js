// src/controllers/clients.controller.js
// => CRUD de clientes (ADMIN e TECH podem listar/criar/editar)
import prisma from '../config/db.js';

export async function listClients(req, res) {
  try {
    const { q } = req.query;
    const clients = await prisma.client.findMany({
      where: q ? { name: { contains: q, mode: 'insensitive' } } : undefined,
      orderBy: { createdAt: 'desc' }
    });
    return res.json(clients);
  } catch {
    return res.status(500).json({ message: 'Erro ao listar clientes' });
  }
}

export async function getClient(req, res) {
  try {
    const { id } = req.params;
    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) return res.status(404).json({ message: 'Cliente não encontrado' });
    return res.json(client);
  } catch {
    return res.status(400).json({ message: 'Erro ao obter cliente' });
  }
}

export async function createClient(req, res) {
  try {
    const data = req.body; // {name, cnpj?, type, email?, phone?, address?, notes?}
    const client = await prisma.client.create({ data });
    return res.status(201).json(client);
  } catch {
    return res.status(400).json({ message: 'Erro ao criar cliente' });
  }
}

export async function updateClient(req, res) {
  try {
    const { id } = req.params;
    const client = await prisma.client.update({ where: { id }, data: req.body });
    return res.json(client);
  } catch {
    return res.status(400).json({ message: 'Erro ao atualizar cliente' });
  }
}

export async function deleteClient(req, res) {
  try {
    const { id } = req.params;
    await prisma.client.delete({ where: { id } });
    return res.status(204).send();
  } catch {
    return res.status(400).json({ message: 'Erro ao excluir cliente' });
  }
}
