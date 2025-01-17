// routes/suspiciousActivitiesRoutes.js
const express = require('express');
const { logSuspiciousActivity, getSuspiciousActivities } = require('../models/SuspiciousActivity');
const { body, validationResult } = require('express-validator');
const { authenticateToken, authorizeAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * Rota para registrar uma nova atividade suspeita
 * Disponível apenas para usuários autenticados
 */
router.post(
    '/',
    authenticateToken, // Garante que o usuário esteja autenticado
    [
        body('userId').notEmpty().withMessage('O campo userId é obrigatório.').isInt().withMessage('userId deve ser um número inteiro.'),
        body('transactionId').notEmpty().withMessage('O campo transactionId é obrigatório.').isInt().withMessage('transactionId deve ser um número inteiro.'),
        body('reason').notEmpty().withMessage('O campo reason é obrigatório.').isString().withMessage('reason deve ser uma string.')
    ],
    async (req, res) => {
        // Verifica se há erros de validação
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { userId, transactionId, reason } = req.body;

        try {
            await logSuspiciousActivity(userId, transactionId, reason);
            res.status(201).json({ success: true, message: 'Atividade suspeita registrada com sucesso.' });
        } catch (error) {
            console.error('Erro ao registrar atividade suspeita:', error);
            res.status(500).json({ success: false, message: 'Erro interno ao tentar registrar atividade suspeita.' });
        }
    }
);

/**
 * Rota para listar todas as atividades suspeitas
 * Disponível apenas para administradores
 */
router.get(
    '/',
    authenticateToken,
    authorizeAdmin, // Garante que apenas administradores possam acessar esta rota
    async (req, res) => {
        try {
            const activities = await getSuspiciousActivities();
            res.status(200).json({ success: true, activities });
        } catch (error) {
            console.error('Erro ao obter atividades suspeitas:', error);
            res.status(500).json({ success: false, message: 'Erro interno ao tentar obter atividades suspeitas.' });
        }
    }
);

module.exports = router;
