// src/controllers/services.controller.js
// ✅ Controller de Serviços (CRUD) com validação de enum e normalização

import prisma from "../config/db.js";
import { Prisma, ServiceCategory } from "@prisma/client"; // ← para ler os enums do Prisma

// ---- Helpers ---------------------------------------------------------------
// 🔤 Mapa de rótulos amigáveis -> valores do enum ServiceCategory
const CATEGORY_MAP = {
  INFRAESTRUTURA: "INFRA",
  HELPDESK: "HELPDESK",
  BACKUP: "BACKUP",
  REDE: "REDE",
  SERVIDOR: "SERVIDOR",
  USUÁRIO: "USUARIO",
  USUARIO: "USUARIO",
  GESTÃO: "GESTAO",
  GESTAO: "GESTAO",
  IMPRESSORA: "IMPRESSORA",
  SEGURANÇA: "SEGURANCA",
  SEGURANCA: "SEGURANCA",
  WEB: "WEB",
  TREINAMENTO: "TREINAMENTO",
  "E-MAIL": "EMAIL",
  EMAIL: "EMAIL",
  SISTEMA: "SISTEMA",
};

// 📌 conjunto com valores válidos do enum
const ALLOWED = new Set(Object.values(ServiceCategory));

// 🔧 normaliza categoria recebida do frontend para o enum do Prisma
function normalizeCategory(cat) {
  const raw = String(cat ?? "")
    .trim()
    .toUpperCase();
  const mapped = CATEGORY_MAP[raw] ?? raw;
  return mapped;
}

// 🔒 valida campos obrigatórios
function validateRequired({ name, description, price, unit, category }) {
  if (
    !name ||
    !description ||
    price === undefined ||
    price === null ||
    !unit ||
    !category
  ) {
    return "Campos obrigatórios: name, description, price, unit, category";
  }
  if (Number.isNaN(Number(price))) return "Preço inválido";
  return null;
}

// 🧯 responde erro padrão
function handleError(res, err, msg = "Erro interno") {
  console.error(msg, err);
  return res.status(500).json({ error: msg });
}

// ---- Controllers -----------------------------------------------------------

// GET /api/services  (?q=...&category=INFRA)
export const getServices = async (req, res) => {
  try {
    const { q, category } = req.query;

    const where = {};
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }
    if (category) {
      const cat = normalizeCategory(category);
      if (ALLOWED.has(cat)) where.category = cat;
    }

    const services = await prisma.service.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return res.json(services);
  } catch (err) {
    return handleError(res, err, "Erro ao buscar serviços");
  }
};

// POST /api/services
export const createService = async (req, res) => {
  try {
    const { name, description, price, category, unit } = req.body;

    // ✅ validações
    const missing = validateRequired({
      name,
      description,
      price,
      unit,
      category,
    });
    if (missing) return res.status(400).json({ error: missing });

    const cat = normalizeCategory(category);
    if (!ALLOWED.has(cat)) {
      return res.status(400).json({ error: `Categoria inválida: ${category}` });
    }

    const service = await prisma.service.create({
      data: {
        name: String(name).trim(),
        description: String(description).trim(),
        price: Number(price),
        unit: String(unit).trim(),
        category: cat, // enum do Prisma
      },
    });

    return res.status(201).json(service);
  } catch (err) {
    // 🎯 trata erros comuns do Prisma
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return handleError(
        res,
        err,
        `Erro ao criar serviço (código: ${err.code})`
      );
    }
    return handleError(res, err, "Erro ao criar serviço");
  }
};

// PUT /api/services/:id
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, unit } = req.body;

    // Campos opcionais, mas quando vierem, validar
    const data = {};
    if (name !== undefined) data.name = String(name).trim();
    if (description !== undefined)
      data.description = String(description).trim();
    if (price !== undefined) {
      if (Number.isNaN(Number(price)))
        return res.status(400).json({ error: "Preço inválido" });
      data.price = Number(price);
    }
    if (unit !== undefined) data.unit = String(unit).trim();
    if (category !== undefined) {
      const cat = normalizeCategory(category);
      if (!ALLOWED.has(cat))
        return res
          .status(400)
          .json({ error: `Categoria inválida: ${category}` });
      data.category = cat;
    }

    const service = await prisma.service.update({
      where: { id },
      data,
    });

    return res.json(service);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return res.status(404).json({ error: "Serviço não encontrado" });
    }
    return handleError(res, err, "Erro ao atualizar serviço");
  }
};

// DELETE /api/services/:id
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.service.delete({ where: { id } });
    return res.json({ message: "Serviço removido com sucesso" });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return res.status(404).json({ error: "Serviço não encontrado" });
    }
    return handleError(res, err, "Erro ao deletar serviço");
  }
};
