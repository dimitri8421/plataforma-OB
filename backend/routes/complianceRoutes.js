// routes/complianceRoutes.js
const express = require('express');
const {
    getComplianceStatus,
    updateComplianceStatus,
    listAllComplianceRecords
} = require('../controllers/complianceController');
const { authenticateToken, authorizeAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * Rota para obter o status de conformidade de um usuário específico
 * Disponível apenas para o próprio usuário autenticado ou administradores
 */
router.get('/status', authenticateToken, async (req, res) => {
    try {
        await getComplianceStatus(req, res);
    } catch (error) {
        console.error('Erro ao obter o status de conformidade:', error);
        res.status(500).json({ success: false, message: 'Erro interno ao tentar obter o status de conformidade.' });
    }
});

/**
 * Rota para atualizar o status de conformidade de um usuário
 * Disponível apenas para administradores
 */
router.put('/status/:userId', authenticateToken, authorizeAdmin, async (req, res) => {
    const { userId } = req.params;

    try {
        await updateComplianceStatus(req, res, userId);
    } catch (error) {
        console.error(`Erro ao atualizar o status de conformidade para o usuário com ID ${userId}:`, error);
        res.status(500).json({ success: false, message: 'Erro interno ao tentar atualizar o status de conformidade.' });
    }
});

/**
 * Rota para listar todos os registros de conformidade
 * Disponível apenas para administradores
 */
router.get('/all', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        await listAllComplianceRecords(req, res);
    } catch (error) {
        console.error('Erro ao listar todos os registros de conformidade:', error);
        res.status(500).json({ success: false, message: 'Erro interno ao tentar listar os registros de conformidade.' });
    }
});

module.exports = router;
