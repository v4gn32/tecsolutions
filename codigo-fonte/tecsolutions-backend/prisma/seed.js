// prisma/seed.js
// Execute: node prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('@T231009s', 10);

  // Usuário Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tecsolutions.com.br' },
    update: {},
    create: {
      name: 'Admin Tec',
      email: 'admin@tecsolutions.com.br',
      password: passwordHash,
      role: 'ADMIN',
    },
  });

  // Cliente exemplo
  const client = await prisma.client.upsert({
    where: { email: 'elen@alloraconstrutora.com.br' },
    update: {},
    create: {
      name: 'Allora Construtora',
      cnpj: '37.140.411/0001-92',
      email: 'elen@alloraconstrutora.com.br',
      phone: '11992125431',
      address: 'Rua Pedroso Alvarenga, 691, Conj 508 Edif Time Offices - Itaim Bibi, São Paulo - SP, 04.531-011',
    },
  });

  // Serviço exemplo
  const service = await prisma.service.create({
    data: {
      title: 'Suporte Remoto',
      description: 'Instalação e configuração de software via acesso remoto.',
      price: 1500,
      clientId: client.id,
    },
  });

  // Produto exemplo
  const product = await prisma.product.create({
    data: {
      name: 'Servidor Dell R740',
      category: 'Hardware',
      price: 15000,
      stock: 2,
      clientId: client.id,
    },
  });

  console.log({ admin, client, service, product });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
