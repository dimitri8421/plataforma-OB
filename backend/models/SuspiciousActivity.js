// models/SuspiciousActivity.js
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

// Função para registrar uma atividade suspeita
const logSuspiciousActivity = async (userId, transactionId, reason) => {
    const query = 'INSERT INTO SuspiciousActivities (userId, transactionId, reason, status, createdAt, updatedAt) VALUES (?, ?, ?, "reported", NOW(), NOW())';
    const values = [userId, transactionId, reason];

    try {
        const [results] = await pool.query(query, values);
        console.log('Atividade suspeita registrada com ID:', results.insertId);
        return results.insertId;
    } catch (error) {
        console.error('Erro ao registrar atividade suspeita:', error);
        throw error;
    }
};

// Função para obter todas as atividades suspeitas
const getSuspiciousActivities = async () => {
    const query = 'SELECT * FROM SuspiciousActivities ORDER BY createdAt DESC';

    try {
        const [results] = await pool.query(query);
        return results;
    } catch (error) {
        console.error('Erro ao obter atividades suspeitas:', error);
        throw error;
    }
};

// Função para obter detalhes de uma atividade suspeita específica
const getSuspiciousActivityById = async (activityId) => {
    const query = 'SELECT * FROM SuspiciousActivities WHERE id = ?';
    const values = [activityId];

    try {
        const [results] = await pool.query(query, values);
        return results[0] || null; // Retorna a primeira atividade ou null se não encontrar
    } catch (error) {
        console.error('Erro ao obter detalhes da atividade suspeita:', error);
        throw error;
    }
};

// Função para atualizar o status de uma atividade suspeita
const updateSuspiciousActivityStatus = async (activityId, status, comments) => {
    const query = 'UPDATE SuspiciousActivities SET status = ?, comments = ?, updatedAt = NOW() WHERE id = ?';
    const values = [status, comments, activityId];

    try {
        const [result] = await pool.query(query, values);
        if (result.affectedRows === 0) return null; // Retorna null se nenhuma linha foi atualizada

        // Retorna a atividade atualizada
        const updatedActivity = await getSuspiciousActivityById(activityId);
        return updatedActivity;
    } catch (error) {
        console.error('Erro ao atualizar status da atividade suspeita:', error);
        throw error;
    }
};

module.exports = {
    logSuspiciousActivity,
    getSuspiciousActivities,
    getSuspiciousActivityById,
    updateSuspiciousActivityStatus
};
