// prisma/seed.js
// Execute com: node prisma/seed.js

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seed TecSolutions iniciado...");

  // 1) Usuário Admin (upsert por email UNIQUE)
  console.log("→ Upsert Admin...");
  const passwordHash = await bcrypt.hash("@T231009s", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@tecsolutions.com.br" },
    update: {},
    create: {
      name: "Admin Tec",
      email: "admin@tecsolutions.com.br",
      password: passwordHash,
      role: "ADMIN",
    },
  });

  // 2) Cliente exemplo (upsert por email UNIQUE adicionado no schema)
  console.log("→ Upsert Client Allora...");
  const client = await prisma.client.upsert({
    where: { email: "elen@alloraconstrutora.com.br" },
    update: {
      name: "Allora Construtora",
      phone: "11992125431",
      address:
        "Rua Pedroso Alvarenga, 691, Conj 508 - Itaim Bibi, São Paulo - SP, 04531-011",
      notes: "Cliente seed inicial",
      document: "37.140.411/0001-92", // usamos o campo 'document' do schema
    },
    create: {
      name: "Allora Construtora",
      document: "37.140.411/0001-92",
      email: "elen@alloraconstrutora.com.br",
      phone: "11992125431",
      address:
        "Rua Pedroso Alvarenga, 691, Conj 508 - Itaim Bibi, São Paulo - SP, 04531-011",
      notes: "Cliente seed inicial",
      type: "CONTRACT",
    },
  });

  // 3) Catálogo - Service e Product (upsert por campos únicos)
  console.log("→ Upsert Service & Product...");
  const service = await prisma.service.upsert({
    where: { name: "Suporte Remoto (hora)" }, // name é UNIQUE no schema
    update: {},
    create: {
      name: "Suporte Remoto (hora)",
      description: "Instalação e configuração via acesso remoto.",
      unitPrice: 150.0, // Decimal
      isActive: true,
    },
  });

  const product = await prisma.product.upsert({
    where: { sku: "SRV-D740-01" }, // sku é UNIQUE
    update: {
      name: "Servidor Dell R740",
      description: "Servidor de alta performance para virtualização.",
      category: "HARDWARE",
      unitPrice: 15000.0,
      isActive: true,
    },
    create: {
      name: "Servidor Dell R740",
      description: "Servidor de alta performance para virtualização.",
      category: "HARDWARE",
      unitPrice: 15000.0,
      sku: "SRV-D740-01",
      isActive: true,
    },
  });

  // 4) Inventário de Hardware (usa o model HardwareAsset)
  console.log("→ Criando HardwareAsset...");
  const hardware = await prisma.hardwareAsset.upsert({
    where: { serialNumber: "DL5420-ABC123" }, // serial único
    update: {
      clientId: client.id,
      status: "ACTIVE",
    },
    create: {
      clientId: client.id,
      type: "Laptop",
      brand: "Dell",
      model: "Latitude 5420",
      serialNumber: "DL5420-ABC123",
      status: "ACTIVE",
      os: "Windows 11 Pro",
      cpu: "Intel i7",
      ramGb: 16,
      storageType: "NVMe",
      storageGb: 512,
      location: "Escritório",
      notes: "Notebook principal",
    },
  });

  // 5) Inventário de Software (usa o model SoftwareLicense)
  console.log("→ Criando SoftwareLicense...");
  const software = await prisma.softwareLicense.upsert({
    where: { licenseKey: "OFF365-XXXX-YYYY-ZZZZ" },
    update: { clientId: client.id, status: "ACTIVE" },
    create: {
      clientId: client.id,
      name: "Microsoft 365 Business Standard",
      version: "2023",
      vendor: "Microsoft",
      licenseKey: "OFF365-XXXX-YYYY-ZZZZ",
      seats: 10,
      assignedSeats: 5,
      status: "ACTIVE",
    },
  });

  // 6) Tickets (usa o model Ticket + enum e campos corretos)
  console.log("→ Criando Tickets...");
  const remoteTicket = await prisma.ticket.create({
    data: {
      clientId: client.id,
      createdById: admin.id,
      type: "REMOTE",
      title: "Configuração de e-mail corporativo",
      description: "Criação de conta e ajuste de DNS",
      status: "RESOLVED",
      timeSpentHrs: 1.5,
      finishedAt: new Date(),
    },
  });

  const onsiteTicket = await prisma.ticket.create({
    data: {
      clientId: client.id,
      createdById: admin.id,
      type: "ONSITE",
      title: "Troca de switch de rede",
      description: "Substituição por modelo gigabit",
      status: "IN_PROGRESS",
    },
  });

  // 6.1) Material usado no ticket (opcional)
  await prisma.ticketMaterial.create({
    data: {
      ticketId: onsiteTicket.id,
      name: "Switch 24p Gigabit",
      productId: product.id,
      quantity: 1,
      unitCost: 1200.0,
      notes: "Material aplicado no local",
    },
  });

  // 7) Proposta com itens (atende campos obrigatórios)
  console.log("→ Criando Proposal + Items...");
  const proposal = await prisma.proposal.create({
    data: {
      clientId: client.id,
      createdById: admin.id,
      number: 2025001, // obrigatório + unique
      title: "Implantação de infraestrutura de rede",
      status: "DRAFT",
      notes: "Proposta inicial",

      items: {
        create: [
          {
            productId: product.id,
            description: "Servidor Dell R740",
            quantity: 1,
            unitPrice: product.unitPrice,
            lineTotal: product.unitPrice, // 1 * unitPrice
          },
          {
            serviceId: service.id,
            description: "Horas de suporte remoto",
            quantity: 10,
            unitPrice: service.unitPrice,
            lineTotal: 10 * Number(service.unitPrice),
          },
        ],
      },

      // Totais (exemplo simples)
      subtotal: 15000.0 + 10 * 150.0,
      discount: 0.0,
      taxes: 0.0,
      total: 15000.0 + 10 * 150.0,
    },
    include: { items: true },
  });

  console.log("✅ Seed concluído!");
  console.log({
    admin: admin.email,
    client: client.name,
    service: service.name,
    product: product.name,
    hardware: hardware.serialNumber,
    software: software.name,
    remoteTicket: remoteTicket.id,
    onsiteTicket: onsiteTicket.id,
    proposal: proposal.number,
  });
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
