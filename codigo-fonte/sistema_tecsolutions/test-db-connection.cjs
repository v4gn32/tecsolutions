const { Pool } = require('pg');
require('dotenv').config();

const dbConfig = {
  host: process.env.VITE_DB_HOST,
  port: parseInt(process.env.VITE_DB_PORT || '5432'),
  database: process.env.VITE_DB_NAME,
  user: process.env.VITE_DB_USER,
  password: process.env.VITE_DB_PASSWORD,
  ssl: process.env.VITE_DB_SSL === 'true'
};

const pool = new Pool(dbConfig);

async function testConnection() {
  try {
    console.log('Testando conexão com PostgreSQL...');
    console.log('Configuração:', {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      ssl: dbConfig.ssl
    });
    
    const client = await pool.connect();
    console.log('✅ Conexão estabelecida com sucesso!');
    
    const result = await client.query('SELECT NOW() as current_time');
    console.log('⏰ Hora atual do banco:', result.rows[0].current_time);
    
    client.release();
    
    // Testar se as tabelas existem
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 Tabelas encontradas:');
    tablesResult.rows.forEach(row => {
      console.log('  -', row.table_name);
    });
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    console.error('Detalhes do erro:', error);
  } finally {
    await pool.end();
  }
}

testConnection();