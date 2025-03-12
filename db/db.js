// Importa o módulo 'Pool' da biblioteca 'pg' (node-postgres) para gerenciar conexões com o banco de dados PostgreSQL
const { Pool } = require('pg');

// Carrega as variáveis de ambiente do arquivo .env para o processo (process.env)
require('dotenv').config();

// Cria uma instância do Pool para gerenciar conexões com o banco de dados PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

module.exports = pool;