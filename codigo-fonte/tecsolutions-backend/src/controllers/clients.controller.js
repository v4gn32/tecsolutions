// src/controllers/clients.controller.js
import prisma from "../config/db.js";

// Listar todos os clientes
export const getClients = async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar clientes" });
  }
};

// Criar novo cliente
export const createClient = async (req, res) => {
  const { name, email, phone, company, cnpj, address } = req.body;

  try {
    const client = await prisma.client.create({
      data: { name, email, phone, company, cnpj, address },
    });
    res.status(201).json(client);
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar cliente" });
  }
};

// Atualizar cliente
export const updateClient = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, company, cnpj, address } = req.body;

  try {
    const client = await prisma.client.update({
      where: { id },
      data: { name, email, phone, company, cnpj, address },
    });
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar cliente" });
  }
};

// Deletar cliente
export const deleteClient = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.client.delete({ where: { id } });
    res.json({ message: "Cliente removido com sucesso" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao deletar cliente" });
  }
};
