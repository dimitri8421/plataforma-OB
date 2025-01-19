const { Pool } = require('pg');
require('dotenv').config(); // Carrega as variáveis de ambiente

// Configuração da pool de conexões com PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST || '177.153.59.51',  // Host do banco de dados
    user: process.env.DB_USER || 'postgres',  // Usuário do banco de dados
    password: process.env.DB_PASSWORD || 'Skatesz11?',  // Senha do banco de dados
    database: process.env.DB_NAME || 'postgres',  // Nome do banco de dados
    port: process.env.DB_PORT || 5432,  // Porta padrão do PostgreSQL
    max: 10,  // Limite de conexões simultâneas
    idleTimeoutMillis: 30000,  // Tempo antes de encerrar conexões inativas (em ms)
    connectionTimeoutMillis: 2000,  // Tempo limite para estabelecer conexão (em ms)
});


// Função para testar a conexão com o banco de dados
async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('Conectado ao PostgreSQL com sucesso!');
        client.release(); // Libera a conexão após o teste
    } catch (err) {
        console.error('Erro ao conectar ao PostgreSQL:', err.message);
        throw err; // Lança o erro para que o servidor saiba que houve uma falha
    }
}

// Chama a função para testar a conexão
testConnection().catch((err) => {
    console.error('Não foi possível iniciar o servidor devido à falha na conexão com o banco de dados:', err);
    process.exit(1); // Encerra o processo caso a conexão falhe
});

// Exporta a pool para ser usada em outros módulos
module.exports = pool;
