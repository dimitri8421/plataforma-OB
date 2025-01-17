const pool = require('../config/db'); // Conexão com o banco de dados

// Função para criar conta demo e real
async function createUserAccounts(userId) {
    try {
        const demoQuery = 'INSERT INTO conta_demo (user_id, saldo) VALUES (?, ?)';
        const realQuery = 'INSERT INTO conta_real (user_id, saldo) VALUES (?, ?)';

        const connection = await pool.getConnection();
        
        await connection.query(demoQuery, [userId, 10000.00]);  // Conta demo com 10k
        await connection.query(realQuery, [userId, 0.00]);      // Conta real com 0 reais

        connection.release();
    } catch (error) {
        console.error('Erro ao criar contas para o usuário:', error);
        throw new Error('Erro ao criar contas');
    }
}

// Função para adicionar depósito na conta real
async function depositToRealAccount(userId, depositAmount) {
    try {
        const query = 'UPDATE conta_real SET saldo = saldo + ? WHERE user_id = ?';

        const connection = await pool.getConnection();
        await connection.query(query, [depositAmount, userId]);  // Atualiza saldo na conta real
        connection.release();
    } catch (error) {
        console.error('Erro ao realizar depósito na conta real:', error);
        throw new Error('Erro ao realizar depósito');
    }
}

// Função para obter saldo da conta real
async function getRealAccountBalance(userId) {
    try {
        const query = 'SELECT saldo FROM conta_real WHERE user_id = ?';
        const connection = await pool.getConnection();
        const [result] = await connection.query(query, [userId]);

        connection.release();
        return result[0] ? result[0].saldo : 0;
    } catch (error) {
        console.error('Erro ao buscar saldo da conta real:', error);
        throw new Error('Erro ao buscar saldo da conta real');
    }
}

// Função para obter saldo da conta demo
async function getDemoAccountBalance(userId) {
    try {
        const query = 'SELECT saldo FROM conta_demo WHERE user_id = ?';
        const connection = await pool.getConnection();
        const [result] = await connection.query(query, [userId]);

        connection.release();
        return result[0] ? result[0].saldo : 0;
    } catch (error) {
        console.error('Erro ao buscar saldo da conta demo:', error);
        throw new Error('Erro ao buscar saldo da conta demo');
    }
}

module.exports = {
    createUserAccounts,
    depositToRealAccount,
    getRealAccountBalance,
    getDemoAccountBalance
};
