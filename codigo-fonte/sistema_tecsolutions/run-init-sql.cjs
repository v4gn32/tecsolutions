require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.VITE_DB_HOST,
  port: parseInt(process.env.VITE_DB_PORT),
  database: process.env.VITE_DB_NAME,
  user: process.env.VITE_DB_USER,
  password: process.env.VITE_DB_PASSWORD,
  ssl: process.env.VITE_DB_SSL === 'true'
});

async function runInitSQL() {
  try {
    console.log('Executando script de inicialização do banco...');
    
    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, 'database', 'init.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Executar o SQL
    await pool.query(sqlContent);
    
    console.log('✅ Script de inicialização executado com sucesso!');
    
    // Verificar as tabelas criadas
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('📋 Tabelas criadas:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao executar script:', error.message);
  } finally {
    await pool.end();
  }
}

runInitSQL();