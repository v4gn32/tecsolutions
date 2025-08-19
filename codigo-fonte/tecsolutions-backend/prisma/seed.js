// prisma/seed.js
// 🔧 Popula: User (ADMIN), Clients (empresa+responsável), Services, Products

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 0) (opcional em DEV) zera tabelas para rodar seed à vontade
  //    -> comente se não quiser limpar
  await prisma.$transaction([
    prisma.product.deleteMany({}),
    prisma.service.deleteMany({}),
    prisma.client.deleteMany({}),
    prisma.user.deleteMany({}),
  ]);

  // 1) Usuário ADMIN (upsert garante idempotência)
  await prisma.user.upsert({
    where: { email: "admin@tecsolutions.com.br" },
    update: {}, // nada a atualizar no seed
    create: {
      name: "Administrador",
      email: "admin@tecsolutions.com.br",
      password: await bcrypt.hash("admin123", 10), // 🔐 senha hash
      role: "ADMIN", // enum/STRING conforme seu schema
    },
  });

  // 2) Clientes (empresa = cliente + responsável)
  await prisma.client.createMany({
    data: [
      {
        companyName: "CFCA Lider", // 🏢 empresa
        address: "Rua Briquet, 123 - SP", // 📍 endereço
        contactName: "Eric", // 👤 responsável
        contactEmail: "eric@cfca.com.br", // ✉️ e-mail (único)
        contactPhone: "11 99999-0001", // ☎️ telefone
        type: "AVULSO", // 🔖 tipo
      },
      {
        companyName: "Allora Construtora",
        address: "Av. Pedro Alvarenga, 456 - SP",
        contactName: "Sandra Lagi",
        contactEmail: "sandra@alloraconstrutora.com.br",
        contactPhone: "11 99999-0002",
        type: "CONTRATO",
        contractStart: new Date("2025-08-01"),
        contractEnd: new Date("2026-07-31"),
      },
    ],
    skipDuplicates: true, // evita erro se rodar 2x
  });

  // 3) Serviços
  await prisma.service.createMany({
    data: [
      {
        name: "Suporte Helpdesk",
        description: "Suporte remoto e presencial para usuários",
        price: 120.0, // se for Decimal no schema, string também funciona: "120.00"
        category: "HELPDESK", // deve casar com enum se existir
        unit: "hora", // idem
      },
      {
        name: "Instalação e Configuração de Impressora",
        description: "Nova Impressora HP DeskJet Ink Advantage 5480",
        price: 120.0,
        category: "INSTALACAO",
        unit: "hora",
      },
    ],
    skipDuplicates: true,
  });

  // 4) Produtos
  await prisma.product.createMany({
    data: [
      {
        name: "Switch 24 portas",
        description: "Switch gerenciável 24 portas Gigabit",
        price: 890.0,
        category: "EQUIPAMENTOS",
        unit: "unidade",
        brand: "TP-Link",
        model: "TL-SG1024DE",
        stock: 5,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed executado com sucesso!");
}

main()
  .catch((e) => {
    console.error("Seed ERROR:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
