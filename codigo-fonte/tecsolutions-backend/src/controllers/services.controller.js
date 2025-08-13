// src/controllers/services.controller.js
import prisma from "../config/db.js";

// Listar serviços
export const getServices = async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar serviços" });
  }
};

// Criar serviço
export const createService = async (req, res) => {
  const { name, description, price, category, unit } = req.body;

  try {
    const service = await prisma.service.create({
      data: { name, description, price, category, unit },
    });
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar serviço" });
  }
};

// Atualizar serviço
export const updateService = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, unit } = req.body;

  try {
    const service = await prisma.service.update({
      where: { id },
      data: { name, description, price, category, unit },
    });
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar serviço" });
  }
};

// Deletar serviço
export const deleteService = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.service.delete({ where: { id } });
    res.json({ message: "Serviço removido com sucesso" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao deletar serviço" });
  }
};
