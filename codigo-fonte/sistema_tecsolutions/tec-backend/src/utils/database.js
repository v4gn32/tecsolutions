const { PrismaClient } = require('@prisma/client');

// Configuração do Prisma Client
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  errorFormat: 'pretty',
});

// Função para conectar ao banco de dados
async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados PostgreSQL');
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados:', error);
    process.exit(1);
  }
}

// Função para desconectar do banco de dados
async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    console.log('✅ Desconectado do banco de dados');
  } catch (error) {
    console.error('❌ Erro ao desconectar do banco de dados:', error);
  }
}

// Função para verificar a saúde do banco de dados
async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', message: 'Banco de dados funcionando corretamente' };
  } catch (error) {
    return { status: 'unhealthy', message: error.message };
  }
}

// Função para executar transações
async function executeTransaction(operations) {
  try {
    const result = await prisma.$transaction(operations);
    return { success: true, data: result };
  } catch (error) {
    console.error('Erro na transação:', error);
    return { success: false, error: error.message };
  }
}

// Função para backup de dados (apenas estrutura)
async function getDatabaseInfo() {
  try {
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `;
    
    const counts = {};
    for (const table of tables) {
      const tableName = table.table_name;
      if (tableName !== '_prisma_migrations') {
        try {
          const count = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "${tableName}"`);
          counts[tableName] = parseInt(count[0].count);
        } catch (error) {
          counts[tableName] = 'Erro ao contar';
        }
      }
    }

    return {
      tables: tables.map(t => t.table_name),
      counts
    };
  } catch (error) {
    console.error('Erro ao obter informações do banco:', error);
    return null;
  }
}

// Função para limpar dados de teste (apenas em desenvolvimento)
async function clearTestData() {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Limpeza de dados só é permitida em ambiente de desenvolvimento');
  }

  try {
    // Ordem de exclusão respeitando as foreign keys
    await prisma.proposalItem.deleteMany();
    await prisma.proposal.deleteMany();
    await prisma.serviceRecord.deleteMany();
    await prisma.inventoryItem.deleteMany();
    await prisma.product.deleteMany();
    await prisma.service.deleteMany();
    await prisma.clientUser.deleteMany();
    await prisma.client.deleteMany();
    // Não deletar usuários do sistema para manter acesso

    console.log('✅ Dados de teste limpos com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao limpar dados de teste:', error);
    return false;
  }
}

// Função para seed inicial (criar usuário admin padrão)
async function seedInitialData() {
  try {
    const bcrypt = require('bcryptjs');
    
    // Verificar se já existe um usuário admin
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await prisma.user.create({
        data: {
          email: 'admin@tecsolutions.com',
          name: 'Administrador',
          password: hashedPassword,
          role: 'admin',
          isActive: true
        }
      });

      console.log('✅ Usuário administrador padrão criado');
      console.log('📧 Email: admin@tecsolutions.com');
      console.log('🔑 Senha: admin123');
    }

    return true;
  } catch (error) {
    console.error('❌ Erro ao criar dados iniciais:', error);
    return false;
  }
}

// Middleware para logging de queries lentas
prisma.$use(async (params, next) => {
  const before = Date.now();
  const result = await next(params);
  const after = Date.now();
  
  const queryTime = after - before;
  
  // Log queries que demoram mais de 1 segundo
  if (queryTime > 1000) {
    console.warn(`🐌 Query lenta detectada: ${params.model}.${params.action} - ${queryTime}ms`);
  }
  
  return result;
});

// Tratamento de encerramento gracioso
process.on('beforeExit', async () => {
  await disconnectDatabase();
});

process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});

module.exports = {
  prisma,
  connectDatabase,
  disconnectDatabase,
  checkDatabaseHealth,
  executeTransaction,
  getDatabaseInfo,
  clearTestData,
  seedInitialData
};