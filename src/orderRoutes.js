const express = require('express');
const { createOrder, cancelOrder, getUserOrders } = require('../controllers/orderController');
const { verifyToken } = require('../controllers/authController');

const router = express.Router();

// Rota para criar uma nova ordem
router.post('/create', verifyToken, createOrder);

// Rota para cancelar uma ordem
router.put('/cancel/:orderId', verifyToken, cancelOrder);

// Rota para listar todas as ordens do usuário
router.get('/user', verifyToken, getUserOrders);

module.exports = router;
