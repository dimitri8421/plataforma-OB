const express = require('express');
const { createUserAccounts, depositToRealAccount, getRealAccountBalance, getDemoAccountBalance } = require('../accounts/accountModel');
const { authenticateToken } = require('../config/auth'); // Middleware de autenticação

const router = express.Router();

// Rota para criar conta demo e conta real
router.post('/create-accounts', authenticateToken, async (req, res) => {
    const userId = req.user.id;  // O ID do usuário autenticado
    try {
        await createUserAccounts(userId);
        res.status(201).json({ message: 'Contas criadas com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar contas' });
    }
});

// Rota para depositar na conta real
router.post('/deposit', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { amount } = req.body; // Valor do depósito

    try {
        await depositToRealAccount(userId, amount);
        res.status(200).json({ message: `Depósito de R$${amount} realizado com sucesso!` });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao realizar depósito' });
    }
});

// Rota para verificar saldo da conta real
router.get('/real-account-balance', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const balance = await getRealAccountBalance(userId);
        res.status(200).json({ saldo: balance });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar saldo da conta real' });
    }
});

// Rota para verificar saldo da conta demo
router.get('/demo-account-balance', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const balance = await getDemoAccountBalance(userId);
        res.status(200).json({ saldo: balance });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar saldo da conta demo' });
    }
});

module.exports = router;
