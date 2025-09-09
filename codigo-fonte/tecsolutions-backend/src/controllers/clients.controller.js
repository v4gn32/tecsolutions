// src/controllers/clients.controller.js
// CRUD de clientes (Contrato/Avulso)
import prisma from "../config/db.js";

export const listClients = async (req, res) => {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json(clients);
};

export const getClient = async (req, res) => {
  const { id } = req.params;
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client)
    return res.status(404).json({ message: "Cliente não encontrado" });
  res.json(client);
};

export const createClient = async (req, res) => {
  try {
    const { name, type, email, phone, document, address, notes, isActive } =
      req.body;
    const client = await prisma.client.create({
      data: {
        name,
        type: type || "ONE_OFF",
        email,
        phone,
        document,
        address,
        notes,
        isActive: isActive ?? true,
      },
    });
    res.status(201).json({ id: client.id });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erro ao criar cliente", error: err.message });
  }
};

export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, email, phone, document, address, notes, isActive } =
      req.body;
    await prisma.client.update({
      where: { id },
      data: { name, type, email, phone, document, address, notes, isActive },
    });
    res.json({ ok: true });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erro ao atualizar cliente", error: err.message });
  }
};

export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.client.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erro ao excluir cliente", error: err.message });
  }
};
