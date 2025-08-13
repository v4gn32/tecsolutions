// prisma/seed.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Criar usuário admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@tecsolutions.com.br" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@tecsolutions.com.br",
      password: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
    },
  });

  // Criar cliente de exemplo
  await prisma.client.create({
    data: {
      name: "João da Silva",
      email: "joao@email.com",
      phone: "(11) 98765-4321",
      company: "Empresa Exemplo",
      cnpj: "12.345.678/0001-99",
      address: "Rua Exemplo, 123 - SP",
    },
  });

  // Criar serviço
  await prisma.service.create({
    data: {
      name: "Suporte Helpdesk",
      description: "Suporte remoto e presencial para usuários",
      price: 120.0,
      category: "HELPDESK",
      unit: "hora",
    },
  });

  // Criar produto
  await prisma.product.create({
    data: {
      name: "Switch 24 portas",
      description: "Switch gerenciável 24 portas Gigabit",
      price: 890.0,
      category: "EQUIPAMENTOS",
      unit: "unidade",
      brand: "TP-Link",
      model: "TL-SG1024DE",
      stock: 5,
    },
  });

  console.log("✅ Seed executado com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
