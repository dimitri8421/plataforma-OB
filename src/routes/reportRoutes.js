// reportRoutes.js
const express = require('express');
const {
    getHistoricalData,
    generateReport,
    exportReportToPDF,
    exportReportToCSV,
    exportReportToExcel
} = require('../controllers/reportController');
const { authenticateToken, authorizeAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * Rota para obter dados históricos de relatórios
 * Disponível para usuários autenticados e administradores
 */
router.get('/historical', authenticateToken, async (req, res) => {
    try {
        await getHistoricalData(req, res);
    } catch (error) {
        console.error('Erro ao obter dados históricos:', error);
        res.status(500).json({ success: false, message: 'Erro interno ao tentar obter dados históricos.' });
    }
});

/**
 * Rota para gerar um novo relatório
 * Disponível apenas para administradores
 */
router.post('/generate', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        await generateReport(req, res);
    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        res.status(500).json({ success: false, message: 'Erro interno ao tentar gerar relatório.' });
    }
});

/**
 * Rota para exportar um relatório em formato PDF
 * Disponível para usuários autenticados e administradores
 */
router.get('/export/pdf', authenticateToken, async (req, res) => {
    try {
        await exportReportToPDF(req, res);
    } catch (error) {
        console.error('Erro ao exportar relatório para PDF:', error);
        res.status(500).json({ success: false, message: 'Erro interno ao tentar exportar relatório para PDF.' });
    }
});

/**
 * Rota para exportar um relatório em formato CSV
 * Disponível para usuários autenticados e administradores
 */
router.get('/export/csv', authenticateToken, async (req, res) => {
    try {
        await exportReportToCSV(req, res);
    } catch (error) {
        console.error('Erro ao exportar relatório para CSV:', error);
        res.status(500).json({ success: false, message: 'Erro interno ao tentar exportar relatório para CSV.' });
    }
});

/**
 * Rota para exportar um relatório em formato Excel
 * Disponível para usuários autenticados e administradores
 */
router.get('/export/excel', authenticateToken, async (req, res) => {
    try {
        await exportReportToExcel(req, res);
    } catch (error) {
        console.error('Erro ao exportar relatório para Excel:', error);
        res.status(500).json({ success: false, message: 'Erro interno ao tentar exportar relatório para Excel.' });
    }
});

module.exports = router;
