// src/controllers/clients.controller.js
// Controller com tratamento de erros Prisma + normalização de body
import prisma from "../config/db.js";
import { Prisma } from "@prisma/client";

// ✅ Tipos permitidos
const ALLOWED_TYPES = ["CONTRATO", "AVULSO"];

// 🧩 Normaliza body (aceita chaves novas e antigas)
function normalizeBody(b = {}) {
  return {
    // Empresa
    companyName: b.companyName ?? b.company,
    cnpj: b.cnpj ?? null,
    address: b.address,

    // Responsável
    contactName: b.contactName ?? b.name,
    contactEmail: (b.contactEmail ?? b.email)?.toLowerCase().trim(),
    contactPhone: b.contactPhone ?? b.phone,

    // Tipo e datas
    type: b.type ?? "AVULSO",
    contractStart: b.contractStart ? new Date(b.contractStart) : null,
    contractEnd: b.contractEnd ? new Date(b.contractEnd) : null,
  };
}

// 🪙 Traduz alvo do erro P2002 (unique) para msg amigável
function friendlyUniqueMessage(target) {
  const t = Array.isArray(target) ? target.join(",") : target || "";
  if (t.includes("email"))
    return "Já existe cliente com este e-mail (contactEmail).";
  if (t.includes("cnpj")) return "CNPJ já cadastrado.";
  if (t.includes("company")) return "Já existe cliente com esta empresa.";
  return "Registro duplicado em campo(s): " + t;
}

// 📄 Listar (suporta ?type=CONTRATO|AVULSO)
export const getClients = async (req, res) => {
  try {
    const { type } = req.query;
    if (type && !ALLOWED_TYPES.includes(type)) {
      return res
        .status(400)
        .json({ error: "Tipo inválido. Use CONTRATO ou AVULSO." });
    }

    const clients = await prisma.client.findMany({
      where: type ? { type } : undefined,
      orderBy: { createdAt: "desc" },
    });
    res.json(clients);
  } catch (err) {
    console.error("getClients error:", err); // 🧯 log
    res.status(500).json({ error: "Erro ao buscar clientes" });
  }
};

// ➕ Criar (empresa + responsável)
export const createClient = async (req, res) => {
  try {
    const data = normalizeBody(req.body);

    // ✅ Validações mínimas
    if (!data.companyName || !data.address) {
      return res
        .status(400)
        .json({ error: "companyName (empresa) e address são obrigatórios." });
    }
    if (!data.contactName || !data.contactEmail || !data.contactPhone) {
      return res.status(400).json({
        error:
          "Dados do responsável (contactName, contactEmail, contactPhone) são obrigatórios.",
      });
    }
    if (!ALLOWED_TYPES.includes(data.type)) {
      return res
        .status(400)
        .json({ error: "Tipo inválido. Use CONTRATO ou AVULSO." });
    }
    // (opcional) exigir datas quando for CONTRATO
    if (data.type === "CONTRATO" && !data.contractStart) {
      return res.status(400).json({
        error: "contractStart é obrigatório para clientes do tipo CONTRATO.",
      });
    }

    const client = await prisma.client.create({ data });
    res.status(201).json(client);
  } catch (err) {
    console.error("createClient error:", err); // 🧯 log completo no servidor

    // 🔎 Erros conhecidos do Prisma
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return res
          .status(409)
          .json({ error: friendlyUniqueMessage(err.meta?.target) });
      }
      if (err.code === "P2003") {
        return res
          .status(400)
          .json({ error: "Violação de integridade referencial." });
      }
      if (err.code === "P2000") {
        return res
          .status(400)
          .json({ error: "Valor muito longo para um dos campos." });
      }
    }
    res.status(500).json({ error: "Erro ao criar cliente" });
  }
};

// ✏️ Atualizar (parcial)
export const updateClient = async (req, res) => {
  const { id } = req.params;
  const b = req.body;

  try {
    if (b.type && !ALLOWED_TYPES.includes(b.type)) {
      return res
        .status(400)
        .json({ error: "Tipo inválido. Use CONTRATO ou AVULSO." });
    }

    const data = {
      companyName: b.companyName ?? b.company ?? undefined,
      cnpj: b.cnpj === undefined ? undefined : b.cnpj || null,
      address: b.address ?? undefined,

      contactName: b.contactName ?? b.name ?? undefined,
      contactEmail:
        b.contactEmail === undefined && b.email === undefined
          ? undefined
          : (b.contactEmail ?? b.email)?.toLowerCase().trim(),
      contactPhone: b.contactPhone ?? b.phone ?? undefined,

      type: b.type ?? undefined,
      contractStart:
        b.contractStart === undefined
          ? undefined
          : b.contractStart
          ? new Date(b.contractStart)
          : null,
      contractEnd:
        b.contractEnd === undefined
          ? undefined
          : b.contractEnd
          ? new Date(b.contractEnd)
          : null,
    };

    const client = await prisma.client.update({ where: { id }, data });
    res.json(client);
  } catch (err) {
    console.error("updateClient error:", err);
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return res
        .status(409)
        .json({ error: friendlyUniqueMessage(err.meta?.target) });
    }
    res.status(500).json({ error: "Erro ao atualizar cliente" });
  }
};

// 🗑️ Deletar
export const deleteClient = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.client.delete({ where: { id } });
    res.json({ message: "Cliente removido com sucesso" });
  } catch (err) {
    console.error("deleteClient error:", err);
    res.status(500).json({ error: "Erro ao deletar cliente" });
  }
};
