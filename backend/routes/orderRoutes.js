// orderRoutes.js
const express = require('express');
const {
    createOrder,
    cancelOrder,
    getUserOrders
} = require('../controllers/orderController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * Rota para criar uma nova ordem
 * Disponível apenas para usuários autenticados
 */
router.post('/create', authenticateToken, async (req, res) => {
    try {
        await createOrder(req, res);
    } catch (error) {
        console.error('Erro ao criar ordem:', error);
        res.status(500).json({ success: false, message: 'Erro interno ao tentar criar ordem.' });
    }
});

/**
 * Rota para cancelar uma ordem existente
 * Disponível apenas para usuários autenticados
 */
router.put('/cancel/:orderId', authenticateToken, async (req, res) => {
    const { orderId } = req.params;

    try {
        await cancelOrder(req, res, orderId);
    } catch (error) {
        console.error(`Erro ao cancelar a ordem com ID ${orderId}:`, error);
        res.status(500).json({ success: false, message: 'Erro interno ao tentar cancelar ordem.' });
    }
});

/**
 * Rota para listar todas as ordens do usuário autenticado
 * Disponível apenas para usuários autenticados
 */
router.get('/user', authenticateToken, async (req, res) => {
    try {
        await getUserOrders(req, res);
    } catch (error) {
        console.error('Erro ao listar ordens do usuário:', error);
        res.status(500).json({ success: false, message: 'Erro interno ao tentar listar ordens do usuário.' });
    }
});

module.exports = router;
