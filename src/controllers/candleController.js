const { getCandleData, insertCandle, updateCandleById, deleteCandleById } = require('../models/Candle');

// Função para buscar candles históricos com base em intervalo de datas
exports.getCandles = async (req, res) => {
  const { symbol, interval, startDate, endDate } = req.query;

  // Validações básicas
  if (!symbol || !interval) {
    return res.status(400).json({ success: false, message: 'Os campos symbol e interval são obrigatórios.' });
  }

  try {
    const candles = await getCandleData(symbol, interval, startDate, endDate);
    res.status(200).json({ success: true, candles });
  } catch (error) {
    console.error('Erro ao obter candles:', error);
    res.status(500).json({ success: false, message: 'Erro ao obter dados de candles' });
  }
};

// Função para inserir um novo candle
exports.insertCandle = async (req, res) => {
  const { symbol, interval, open, close, high, low, volume, timestamp } = req.body;

  // Validações de entrada
  if (!symbol || !interval || !open || !close || !high || !low || !volume || !timestamp) {
    return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios.' });
  }

  try {
    const candleId = await insertCandle({ symbol, interval, open, close, high, low, volume, timestamp });
    res.status(201).json({ success: true, message: 'Candle inserido com sucesso', candleId });
  } catch (error) {
    console.error('Erro ao inserir candle:', error);
    res.status(500).json({ success: false, message: 'Erro ao inserir candle' });
  }
};

// Função para atualizar um candle específico
exports.updateCandle = async (req, res) => {
  const { candleId } = req.params;
  const { open, close, high, low, volume, timestamp } = req.body;

  // Validação do ID do candle
  if (!candleId) {
    return res.status(400).json({ success: false, message: 'ID do candle é obrigatório.' });
  }

  try {
    const updatedCandle = await updateCandleById(candleId, { open, close, high, low, volume, timestamp });
    if (!updatedCandle) {
      return res.status(404).json({ success: false, message: 'Candle não encontrado.' });
    }
    res.status(200).json({ success: true, message: 'Candle atualizado com sucesso', updatedCandle });
  } catch (error) {
    console.error('Erro ao atualizar candle:', error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar candle' });
  }
};

// Função para excluir um candle específico
exports.deleteCandle = async (req, res) => {
  const { candleId } = req.params;

  // Validação do ID do candle
  if (!candleId) {
    return res.status(400).json({ success: false, message: 'ID do candle é obrigatório.' });
  }

  try {
    const deleted = await deleteCandleById(candleId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Candle não encontrado.' });
    }
    res.status(200).json({ success: true, message: 'Candle excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir candle:', error);
    res.status(500).json({ success: false, message: 'Erro ao excluir candle' });
  }
};
