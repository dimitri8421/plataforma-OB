// models/Candle.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Função para buscar candles históricos
const getCandleData = async (symbol, interval, startDate, endDate) => {
    const query = `
        SELECT * FROM Candles 
        WHERE symbol = ? AND interval = ? AND timestamp BETWEEN ? AND ?
        ORDER BY timestamp ASC
    `;
    const values = [symbol, interval, startDate, endDate];

    try {
        const [results] = await pool.query(query, values);
        return results;
    } catch (error) {
        console.error('Erro ao obter dados de candles:', error);
        throw error;
    }
};

// Função para inserir um novo candle
const insertCandle = async (candleData) => {
    const query = `
        INSERT INTO Candles (symbol, interval, open, close, high, low, volume, timestamp) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
        candleData.symbol, candleData.interval, candleData.open, candleData.close,
        candleData.high, candleData.low, candleData.volume, candleData.timestamp
    ];

    try {
        const [result] = await pool.query(query, values);
        return result.insertId;
    } catch (error) {
        console.error('Erro ao inserir candle:', error);
        throw error;
    }
};

// Função para atualizar um candle específico por ID
const updateCandleById = async (candleId, candleData) => {
    const query = `
        UPDATE Candles 
        SET open = ?, close = ?, high = ?, low = ?, volume = ?, timestamp = ?
        WHERE id = ?
    `;
    const values = [
        candleData.open, candleData.close, candleData.high,
        candleData.low, candleData.volume, candleData.timestamp, candleId
    ];

    try {
        const [result] = await pool.query(query, values);
        return result.affectedRows > 0 ? { id: candleId, ...candleData } : null;
    } catch (error) {
        console.error('Erro ao atualizar candle:', error);
        throw error;
    }
};

// Função para excluir um candle específico por ID
const deleteCandleById = async (candleId) => {
    const query = `DELETE FROM Candles WHERE id = ?`;
    const values = [candleId];

    try {
        const [result] = await pool.query(query, values);
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Erro ao excluir candle:', error);
        throw error;
    }
};

module.exports = {
    getCandleData,
    insertCandle,
    updateCandleById,
    deleteCandleById
};
