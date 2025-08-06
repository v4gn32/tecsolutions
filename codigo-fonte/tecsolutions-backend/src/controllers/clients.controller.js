import prisma from "../config/db.js";

export const getClients = async (req, res) => {
  try {
    const clients = await prisma.client.findMany();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar clientes" });
  }
};

export const createClient = async (req, res) => {
  try {
    const { name, email, phone, company, cnpj, address } = req.body;
    const client = await prisma.client.create({
      data: { name, email, phone, company, cnpj, address },
    });
    res.status(201).json(client);
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar cliente" });
  }
};
