// Importa o módulo 'Pool' da biblioteca 'pg' (node-postgres) para gerenciar conexões com o banco de dados PostgreSQL
const { Pool } = require("pg");

// Carrega as variáveis de ambiente do arquivo .env para o processo (process.env)
require("dotenv").config();

// Verifica se o uso de SSL está ativado via variável de ambiente DB_SSL
// Se DB_SSL === 'true', configura o objeto SSL com base em DB_REJECT_UNAUTHORIZED
// Caso contrário, SSL é desativado (false)
const sslConfig =
  process.env.DB_SSL === "true"
    ? { rejectUnauthorized: process.env.DB_REJECT_UNAUTHORIZED === "true" }
    : false;

// Cria uma instância do Pool para gerenciar conexões com o banco de dados PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: sslConfig,
});

module.exports = pool;
