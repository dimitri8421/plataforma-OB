const express = require('express');
const { getHistoricalData } = require('../controllers/reportController');

const router = express.Router();

// Rota para obter dados históricos
router.get('/historical', getHistoricalData);

module.exports = router;
