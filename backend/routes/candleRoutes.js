// routes/candleRoutes.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const {
    addCandleData,
    getCandleData,
    exportCandleDataToCSV,
    exportCandleDataToExcel,
    exportCandleDataToPDF
} = require('../controllers/candleController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * Rota para adicionar dados de candles
 * Disponível apenas para usuários autenticados
 */
router.post(
    '/add',
    authenticateToken,
    [
        body('symbol').notEmpty().withMessage('O campo symbol é obrigatório.').isString().withMessage('symbol deve ser uma string.'),
        body('interval').notEmpty().withMessage('O campo interval é obrigatório.').isString().withMessage('interval deve ser uma string.'),
        body('open').notEmpty().withMessage('O campo open é obrigatório.').isFloat().withMessage('open deve ser um número decimal.'),
        body('close').notEmpty().withMessage('O campo close é obrigatório.').isFloat().withMessage('close deve ser um número decimal.'),
        body('high').notEmpty().withMessage('O campo high é obrigatório.').isFloat().withMessage('high deve ser um número decimal.'),
        body('low').notEmpty().withMessage('O campo low é obrigatório.').isFloat().withMessage('low deve ser um número decimal.'),
        body('volume').notEmpty().withMessage('O campo volume é obrigatório.').isFloat().withMessage('volume deve ser um número decimal.'),
        body('timestamp').notEmpty().withMessage('O campo timestamp é obrigatório.').isISO8601().withMessage('timestamp deve estar em formato ISO8601.')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        try {
            await addCandleData(req, res);
        } catch (error) {
            console.error('Erro ao adicionar dados de candle:', error);
            res.status(500).json({ success: false, message: 'Erro interno ao tentar adicionar dados de candle.' });
        }
    }
);

/**
 * Rota para recuperar dados de candles
 * Disponível apenas para usuários autenticados
 */
router.get('/get', authenticateToken, async (req, res) => {
    try {
        await getCandleData(req, res);
    } catch (error) {
        console.error('Erro ao recuperar dados de candle:', error);
        res.status(500).json({ success: false, message: 'Erro interno ao tentar recuperar dados de candle.' });
    }
});

/**
 * Rota para exportar dados de candles em formato CSV
 * Disponível apenas para usuários autenticados
 */
router.get('/export/csv', authenticateToken, async (req, res) => {
    try {
        await exportCandleDataToCSV(req, res);
    } catch (error) {
        console.error('Erro ao exportar dados de candle para CSV:', error);
        res.status(500).json({ success: false, message: 'Erro interno ao tentar exportar dados de candle para CSV.' });
    }
});

/**
 * Rota para exportar dados de candles em formato Excel
 * Disponível apenas para usuários autenticados
 */
router.get('/export/excel', authenticateToken, async (req, res) => {
    try {
        await exportCandleDataToExcel(req, res);
    } catch (error) {
        console.error('Erro ao exportar dados de candle para Excel:', error);
        res.status(500).json({ success: false, message: 'Erro interno ao tentar exportar dados de candle para Excel.' });
    }
});

/**
 * Rota para exportar dados de candles em formato PDF
 * Disponível apenas para usuários autenticados
 */
router.get('/export/pdf', authenticateToken, async (req, res) => {
    try {
        await exportCandleDataToPDF(req, res);
    } catch (error) {
        console.error('Erro ao exportar dados de candle para PDF:', error);
        res.status(500).json({ success: false, message: 'Erro interno ao tentar exportar dados de candle para PDF.' });
    }
});

module.exports = router;
