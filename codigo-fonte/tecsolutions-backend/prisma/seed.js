const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário administrador padrão
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@tecsolutions.com' },
    update: {},
    create: {
      email: 'admin@tecsolutions.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'admin',
      isActive: true
    }
  });

  console.log('✅ Usuário administrador criado:', adminUser.email);

  // Criar alguns serviços padrão
  const services = [
    {
      name: 'Suporte Técnico Remoto',
      description: 'Atendimento técnico via acesso remoto',
      price: 80.00,
      category: 'helpdesk',
      unit: 'hora'
    },
    {
      name: 'Suporte Técnico Presencial',
      description: 'Atendimento técnico no local do cliente',
      price: 120.00,
      category: 'helpdesk',
      unit: 'hora'
    },
    {
      name: 'Instalação de Rede',
      description: 'Instalação e configuração de rede local',
      price: 200.00,
      category: 'infraestrutura',
      unit: 'ponto'
    },
    {
      name: 'Backup em Nuvem',
      description: 'Configuração de backup automático em nuvem',
      price: 150.00,
      category: 'backup',
      unit: 'configuração'
    },
    {
      name: 'Cabeamento Estruturado',
      description: 'Instalação de cabeamento estruturado categoria 6',
      price: 50.00,
      category: 'cabeamento',
      unit: 'metro'
    }
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { name: service.name },
      update: {},
      create: service
    });
  }

  console.log('✅ Serviços padrão criados');

  // Criar alguns produtos padrão
  const products = [
    {
      name: 'Cabo de Rede Cat6',
      description: 'Cabo de rede categoria 6 para alta velocidade',
      price: 2.50,
      category: 'cabos',
      unit: 'metro',
      brand: 'Furukawa',
      model: 'Cat6 UTP',
      stock: 1000
    },
    {
      name: 'Switch 24 Portas',
      description: 'Switch gerenciável 24 portas Gigabit',
      price: 800.00,
      category: 'equipamentos',
      unit: 'unidade',
      brand: 'TP-Link',
      model: 'TL-SG1024D',
      stock: 5
    },
    {
      name: 'Roteador Wi-Fi 6',
      description: 'Roteador wireless padrão Wi-Fi 6',
      price: 350.00,
      category: 'equipamentos',
      unit: 'unidade',
      brand: 'ASUS',
      model: 'AX1800',
      stock: 10
    },
    {
      name: 'Conector RJ45',
      description: 'Conector RJ45 categoria 6',
      price: 0.80,
      category: 'conectores',
      unit: 'unidade',
      brand: 'Furukawa',
      model: 'Cat6',
      stock: 500
    }
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { name: product.name },
      update: {},
      create: product
    });
  }

  console.log('✅ Produtos padrão criados');

  // Criar cliente de exemplo
  const exampleClient = await prisma.client.upsert({
    where: { email: 'contato@empresaexemplo.com' },
    update: {},
    create: {
      name: 'João Silva',
      email: 'contato@empresaexemplo.com',
      phone: '(11) 99999-9999',
      company: 'Empresa Exemplo Ltda',
      cnpj: '12.345.678/0001-90',
      street: 'Rua das Flores',
      number: '123',
      complement: 'Sala 456',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      type: 'contrato'
    }
  });

  console.log('✅ Cliente de exemplo criado:', exampleClient.name);

  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });