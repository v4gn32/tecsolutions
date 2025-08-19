// src/controllers/clients.controller.js
// ✅ Controller 100% alinhado ao schema (companyName, contactName, email, phone, cnpj, type, address)
// ✅ Formata e valida Telefone e CNPJ ANTES de salvar (create/update)

import prisma from "../config/db.js";
import { Prisma } from "@prisma/client";

// ------------------------------
// 🔧 Constantes / Helpers
// ------------------------------
const ALLOWED_TYPES = ["CONTRATO", "AVULSO"]; // tipos aceitos

// 🔹 Mantém apenas dígitos
const onlyDigits = (v = "") => String(v).replace(/\D/g, "");

// 🔹 Formata telefone BR (10 ou 11 dígitos)
function formatPhoneBR(value = "") {
  const d = onlyDigits(value);
  if (d.length === 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`; // (AA) NNNN-NNNN
  if (d.length === 11)
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`; // (AA) NNNNN-NNNN
  return value; // tamanho inválido: será barrado na validação
}

// 🔹 Formata CNPJ (14 dígitos)
function formatCNPJ(value = "") {
  const d = onlyDigits(value);
  if (d.length !== 14) return value;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(
    8,
    12
  )}-${d.slice(12)}`;
}

// 🔹 Mensagem amigável para unique
function friendlyUniqueMessage(target) {
  const t = Array.isArray(target) ? target.join(",") : target || "";
  if (t.includes("email")) return "Já existe cliente com este e-mail.";
  if (t.includes("cnpj")) return "CNPJ já cadastrado.";
  if (t.includes("company")) return "Já existe cliente com esta empresa.";
  return "Registro duplicado em: " + t;
}

// ------------------------------
// 🔁 Normalizador de entrada
// ------------------------------
// Aceita chaves antigas (clientType/type, name/contactName, etc.)
// Valida tamanhos e já retorna phone/cnpj FORMATADOS
function normalizeBody(b = {}) {
  const rawType = (b.clientType ?? b.type ?? "AVULSO").toString().toUpperCase();

  const phoneDigits = onlyDigits(b.phone ?? b.contactPhone ?? "");
  const cnpjDigits = onlyDigits(b.cnpj ?? "");

  // ✅ Validações de tamanho
  if (phoneDigits && ![10, 11].includes(phoneDigits.length)) {
    throw new Error("Telefone inválido (use 10 ou 11 dígitos).");
  }
  if (cnpjDigits && cnpjDigits.length !== 14) {
    throw new Error("CNPJ inválido (14 dígitos).");
  }

  return {
    // empresa
    companyName: b.companyName ?? b.company ?? "",
    address: b.address ?? "",
    cnpj: cnpjDigits ? formatCNPJ(cnpjDigits) : null, // 🧾 salva formatado

    // responsável
    contactName: b.contactName ?? b.name ?? "",
    email: (b.email ?? b.contactEmail ?? "").toLowerCase().trim(),
    phone: phoneDigits ? formatPhoneBR(phoneDigits) : "", // 📞 salva formatado

    // enum do Prisma
    type: ALLOWED_TYPES.includes(rawType) ? rawType : "AVULSO",
  };
}

/* ============= LISTAR ============= */
export const getClients = async (req, res) => {
  try {
    const raw = (req.query.clientType ?? req.query.type)
      ?.toString()
      .toUpperCase();
    const filter = raw && ALLOWED_TYPES.includes(raw) ? raw : undefined;

    const clients = await prisma.client.findMany({
      where: filter ? { type: filter } : undefined, // usa campo `type` do schema
      orderBy: { createdAt: "desc" },
    });

    res.json(clients);
  } catch (err) {
    console.error("getClients error:", err);
    res.status(500).json({ error: "Erro ao buscar clientes" });
  }
};

/* ============= CRIAR ============= */
export const createClient = async (req, res) => {
  try {
    const data = normalizeBody(req.body);

    // campos obrigatórios
    if (!data.companyName || !data.address)
      return res
        .status(400)
        .json({ error: "companyName e address são obrigatórios." });
    if (!data.contactName || !data.email || !data.phone)
      return res
        .status(400)
        .json({ error: "contactName, email e phone são obrigatórios." });

    const client = await prisma.client.create({
      data: {
        companyName: data.companyName,
        contactName: data.contactName,
        email: data.email,
        phone: data.phone, // 📞 formatado
        cnpj: data.cnpj, // 🧾 formatado (ou null)
        type: data.type, // CONTRATO | AVULSO
        address: data.address,
      },
    });

    res.status(201).json(client);
  } catch (err) {
    // erros de validação manual
    if (
      err.message?.includes("Telefone inválido") ||
      err.message?.includes("CNPJ inválido")
    ) {
      return res.status(400).json({ error: err.message });
    }

    // erros do Prisma
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002")
        return res
          .status(409)
          .json({ error: friendlyUniqueMessage(err.meta?.target) });
      if (err.code === "P2003")
        return res
          .status(400)
          .json({ error: "Violação de integridade referencial." });
      if (err.code === "P2000")
        return res
          .status(400)
          .json({ error: "Valor muito longo para um dos campos." });
    }

    console.error("createClient error:", err);
    res.status(500).json({ error: "Erro ao criar cliente" });
  }
};

/* ============= ATUALIZAR ============= */
export const updateClient = async (req, res) => {
  const { id } = req.params;
  const b = req.body;

  try {
    // valida enum se veio
    const rawType = (b.clientType ?? b.type)?.toString().toUpperCase();
    if (rawType && !ALLOWED_TYPES.includes(rawType)) {
      return res
        .status(400)
        .json({ error: "Tipo inválido. Use CONTRATO ou AVULSO." });
    }

    // prepara campos opcionais com formatação
    let phone, cnpj;
    if (b.phone ?? b.contactPhone) {
      const d = onlyDigits(b.phone ?? b.contactPhone);
      if (![10, 11].includes(d.length))
        return res
          .status(400)
          .json({ error: "Telefone inválido (10 ou 11 dígitos)." });
      phone = formatPhoneBR(d);
    }
    if (b.cnpj !== undefined) {
      if (b.cnpj) {
        const d = onlyDigits(b.cnpj);
        if (d.length !== 14)
          return res.status(400).json({ error: "CNPJ inválido (14 dígitos)." });
        cnpj = formatCNPJ(d);
      } else {
        cnpj = null; // limpar CNPJ
      }
    }

    const data = {
      companyName: b.companyName ?? b.company ?? undefined,
      address: b.address ?? undefined,
      contactName: b.contactName ?? b.name ?? undefined,
      email:
        b.email === undefined && b.contactEmail === undefined
          ? undefined
          : (b.email ?? b.contactEmail)?.toLowerCase().trim(),
      phone, // 📞 formatado se veio
      cnpj, // 🧾 formatado/null se veio
      type: rawType ?? undefined,
    };

    const client = await prisma.client.update({ where: { id }, data });
    res.json(client);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return res
        .status(409)
        .json({ error: friendlyUniqueMessage(err.meta?.target) });
    }
    console.error("updateClient error:", err);
    res.status(500).json({ error: "Erro ao atualizar cliente" });
  }
};

/* ============= DELETAR ============= */
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
