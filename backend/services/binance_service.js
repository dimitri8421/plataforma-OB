// services/binance_service.js

const { Spot } = require('@binance/connector');
const WebSocket = require('ws');

// Inicializa o cliente da Binance sem autenticação para dados públicos
const client = new Spot(); 

// Função para obter o preço de mercado de um par específico
async function getMarketPrice(pair = 'BTCUSDT') {
  try {
    const response = await client.tickerPrice(pair);
    console.log(`Preço atual para ${pair}:`, response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao obter preço de mercado:', error);
  }
}

// Função para obter dados de candle históricos
async function getHistoricalCandles(pair = 'BTCUSDT', interval = '1m', limit = 10) {
  try {
    const response = await client.klines(pair, interval, { limit });
    console.log(`Dados históricos de candle para ${pair}:`, response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao obter candles históricos:', error);
  }
}

// Função para conectar ao WebSocket e obter dados de candle em tempo real
function subscribeToCandles(pair = 'btcusdt', interval = '1m', onCandleUpdate) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${pair}@kline_${interval}`);

    ws.on('open', () => {
      console.log(`Conectado ao WebSocket para ${pair} no intervalo ${interval}`);
    });

    ws.on('message', (data) => {
      const candleData = JSON.parse(data);
      if (candleData.k) {
        console.log(`Dados de Candle em tempo real para ${pair}:`, candleData.k);
        onCandleUpdate(candleData.k);  // Callback para manipular dados da candle
      }
    });

    ws.on('close', () => {
      console.log('Conexão WebSocket encerrada');
      resolve(); // Resolve a Promise quando o WebSocket for fechado
    });

    ws.on('error', (error) => {
      console.error('Erro no WebSocket:', error);
      reject(error); // Rejeita a Promise em caso de erro
    });

    return ws; // Retorna o WebSocket para permitir o controle externo
  });
}

module.exports = { getMarketPrice, getHistoricalCandles, subscribeToCandles };