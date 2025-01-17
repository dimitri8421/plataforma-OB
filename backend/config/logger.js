const mysql = require('mysql2/promise');
const WebSocket = require('ws');
const config = require('../config/config');
const pool = require('../config/db');
const logger = require('../config/logger'); // Logger para monitoramento

const cc = 'btcusdt';
const interval = '1m';
const socket = `wss://stream.binance.com:9443/ws/${cc}@kline_${interval}`;

function connectWebSocket() {
    const ws = new WebSocket(socket);

    ws.on('open', () => {
        logger.info('Conexão WebSocket estabelecida');
    });

    ws.on('message', async (message) => {
        const jsonMessage = JSON.parse(message);
        const candle = jsonMessage.k;
        const isCandleClosed = candle.x;

        if (isCandleClosed) {
            const open = candle.o;
            const close = candle.c;
            const high = candle.h;
            const low = candle.l;
            const vol = candle.v;
            const timestamp = new Date(candle.t);

            const connection = await pool.getConnection();
            try {
                const query = 'INSERT INTO CandleData (open, close, high, low, volume, timestamp) VALUES (?, ?, ?, ?, ?, ?)';
                await connection.query(query, [open, close, high, low, vol, timestamp]);
                logger.info(`Dados inseridos com sucesso: Open: ${open}, Close: ${close}, High: ${high}, Low: ${low}, Volume: ${vol}, Timestamp: ${timestamp}`);
            } catch (error) {
                logger.error('Erro ao inserir dados no banco de dados:', error);
            } finally {
                connection.release();
            }
        }
    });

    ws.on('close', () => {
        logger.warn('Conexão WebSocket fechada. Tentando reconectar...');
        setTimeout(connectWebSocket, 5000); // Tentativa de reconexão após 5 segundos
    });

    ws.on('error', (error) => {
        logger.error('Erro na conexão WebSocket:', error);
    });
}

connectWebSocket();

module.exports = connectWebSocket;
