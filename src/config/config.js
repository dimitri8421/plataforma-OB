// config/config.js

require('dotenv').config();
const path = require('path');

module.exports = {
    // Configurações do banco de dados
    db: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'mycloud2',
        port: process.env.DB_PORT || 3306,
        connectionLimit: process.env.DB_CONNECTION_LIMIT || 10,  // Limite de conexões simultâneas no pool
    },

    // Configurações do servidor
    server: {
        port: process.env.PORT || 5000,
        environment: process.env.NODE_ENV || 'development',
    },

    // Configurações para segurança
    security: {
        jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret', // Chave para JWT
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',       // Tempo de expiração do JWT
    },

    // Configuração dos logs
    logs: {
        logLevel: process.env.LOG_LEVEL || 'info',  // Níveis: 'error', 'warn', 'info', 'debug'
        logDirectory: process.env.LOG_DIR || path.join(__dirname, '../logs'), // Diretório dos logs
    },

    // Configurações para APIs externas (ex: Binance)
    api: {
        binanceBaseUrl: process.env.BINANCE_BASE_URL || 'https://api.binance.com',
    },

    // Configurações específicas de integração, como rate limits, tempo limite de requisição, etc.
    integration: {
        requestTimeout: process.env.REQUEST_TIMEOUT || 5000,  // Timeout para requisições externas (em ms)
        rateLimit: process.env.RATE_LIMIT || 100,  // Limite de requisições por minuto, útil para configurar express-rate-limit
    },
};