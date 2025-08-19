// prisma/seed.js
// 🔧 Seed minimal: 1 admin, 2 clientes, 3 serviços, 3 produtos

import { PrismaClient, ServiceCategory, ProductCategory } from "@prisma/client"; // <- importa enums AQUI
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// 🛡️ Validação dos enums (evita typo)
const allowServices = new Set(Object.keys(ServiceCategory)); // <- usa enum importado
const allowProducts = new Set(Object.keys(ProductCategory)); // <- idem

// 🔧 Dados
const SERVICES = [
  {
    name: "Suporte Helpdesk",
    desc: "Suporte remoto e presencial",
    price: 120,
    cat: ServiceCategory.HELPDESK,
    unit: "hora",
  },
  {
    name: "Instalação de Software",
    desc: "Instalação/atualização corporativa",
    price: 100,
    cat: ServiceCategory.INSTALACAO,
    unit: "hora",
  },
  {
    name: "Backup em Nuvem",
    desc: "Rotina de backup em nuvem",
    price: 250,
    cat: ServiceCategory.BACKUP,
    unit: "mensal",
  },
];

const PRODUCT = [
  {
    name: "Cabo de Rede Cat6 2m",
    desc: "Cat6 de 2 metros",
    price: 25,
    cat: ProductCategory.CABOS,
    unit: "unidade",
    brand: "Furukawa",
    model: "CAT6-2M",
    stock: 50,
  },
  {
    name: "Roteador Wi‑Fi 6",
    desc: "Dual band Wi‑Fi 6",
    price: 650,
    cat: ProductCategory.EQUIPAMENTOS,
    unit: "unidade",
    brand: "Asus",
    model: "RT-AX55",
    stock: 8,
  },
  {
    name: "Mouse Óptico USB",
    desc: "Mouse com fio USB",
    price: 45,
    cat: ProductCategory.ACESSORIOS,
    unit: "unidade",
    brand: "Logitech",
    model: "M90",
    stock: 25,
  },
];

async function main() {
  // 0) Limpa tabelas (DEV)
  await prisma.$transaction([
    prisma.product.deleteMany({}),
    prisma.service.deleteMany({}),
    prisma.client.deleteMany({}),
    prisma.user.deleteMany({}),
  ]);

  // 1) Admin
  await prisma.user.upsert({
    where: { email: "admin@tecsolutions.com.br" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@tecsolutions.com.br",
      password: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
    },
  });

  // 2) Clientes
  await prisma.client.createMany({
    data: [
      {
        contactName: "Eric",
        companyName: "CFCA Líder",
        email: "eric@cfca.com.br",
        phone: "11999990001",
        cnpj: null,
        type: "AVULSO",
        address: "Rua Briquet, 123 - SP",
      },
      {
        contactName: "Sandra Lagi",
        companyName: "Allora Construtora",
        email: "sandra@alloraconstrutora.com.br",
        phone: "11999990002",
        cnpj: "00000000000130",
        type: "CONTRATO",
        address: "Av. Pedro Alvarenga, 456 - SP",
      },
      {
        contactName: "Denis Kamisaka",
        companyName: "MFC Construtora",
        email: "denis@mfcconstrutora.com.br",
        phone: "11999990003",
        cnpj: "00000000000199",
        type: "CONTRATO",
        address: "Rua das Acácias, 789 - SP",
      },
    ],
    skipDuplicates: true,
  });

  // 3) Serviços (valida enum e cria um a um)
  for (const s of SERVICES) {
    if (!allowServices.has(s.cat))
      throw new Error(`Categoria de serviço inválida: ${s.cat}`);
    await prisma.service.create({
      data: {
        name: s.name,
        description: s.desc,
        price: s.price,
        category: s.cat,
        unit: s.unit,
      },
    });
  }

  // 4) Produtos (valida enum e cria em lote)
  for (const p of PRODUCT) {
    if (!allowProducts.has(p.cat))
      throw new Error(`Categoria de produto inválida: ${p.cat}`);
  }
  await prisma.product.createMany({
    data: PRODUCT.map((p) => ({
      name: p.name,
      description: p.desc,
      price: p.price,
      category: p.cat,
      unit: p.unit,
      brand: p.brand,
      model: p.model,
      stock: p.stock,
    })),
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
