  const Order = require('../models/Order');
const mongoose = require('mongoose');

// Função para criação de uma nova ordem
exports.createOrder = async (req, res) => {
  const { type, asset, quantity, price } = req.body;
  const userId = req.user.id;

  // Validações de entrada
  if (!type || !asset || !quantity || !price) {
    return res.status(400).json({ success: false, message: 'Todos os campos (type, asset, quantity, price) são obrigatórios.' });
  }

  if (!['buy', 'sell'].includes(type)) {
    return res.status(400).json({ success: false, message: 'Tipo de ordem inválido. Deve ser "buy" ou "sell".' });
  }

  if (quantity <= 0 || price <= 0) {
    return res.status(400).json({ success: false, message: 'Quantidade e preço devem ser maiores que zero.' });
  }

  try {
    // Cria uma nova ordem
    const newOrder = new Order({
      userId,
      type,
      asset,
      quantity,
      price,
      status: 'open', // status inicial como 'open'
      createdAt: new Date(),
    });

    await newOrder.save();

    res.status(201).json({ success: true, message: 'Ordem criada com sucesso', order: newOrder });
  } catch (error) {
    console.error('Erro ao criar ordem:', error);
    res.status(500).json({ success: false, message: 'Erro ao criar ordem', error: error.message });
  }
};

// Função para cancelamento de uma ordem
exports.cancelOrder = async (req, res) => {
  const { orderId } = req.params;

  // Validação de entrada
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ success: false, message: 'ID da ordem inválido.' });
  }

  try {
    const order = await Order.findById(orderId);

    // Verifica se a ordem existe
    if (!order) {
      return res.status(404).json({ success: false, message: 'Ordem não encontrada' });
    }

    // Verifica se o usuário é o proprietário da ordem
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Acesso negado: você não tem permissão para cancelar esta ordem.' });
    }

    // Verifica se a ordem está aberta para poder ser cancelada
    if (order.status !== 'open') {
      return res.status(400).json({ success: false, message: 'Ordem não pode ser cancelada, pois seu status não é "open".' });
    }

    // Atualiza o status da ordem para 'canceled'
    order.status = 'canceled';
    order.canceledAt = new Date(); // Armazena a data de cancelamento para referência
    await order.save();

    res.status(200).json({ success: true, message: 'Ordem cancelada com sucesso', order });
  } catch (error) {
    console.error('Erro ao cancelar ordem:', error);
    res.status(500).json({ success: false, message: 'Erro ao cancelar ordem', error: error.message });
  }
};

// Função para listagem de todas as ordens do usuário logado
exports.getUserOrders = async (req, res) => {
  const userId = req.user.id;

  try {
    // Busca todas as ordens do usuário, ordenadas pela data de criação (mais recente primeiro)
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('Erro ao buscar ordens do usuário:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar ordens do usuário', error: error.message });
  }
};

// Função para obter detalhes de uma ordem específica
exports.getOrderDetails = async (req, res) => {
  const { orderId } = req.params;

  // Validação de entrada
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ success: false, message: 'ID da ordem inválido.' });
  }

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Ordem não encontrada' });
    }

    // Verifica se o usuário é o proprietário da ordem
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Acesso negado: você não tem permissão para visualizar esta ordem.' });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('Erro ao obter detalhes da ordem:', error);
    res.status(500).json({ success: false, message: 'Erro ao obter detalhes da ordem', error: error.message });
  }
};

// Função para listagem de todas as ordens abertas
exports.getAllOpenOrders = async (req, res) => {
  try {
    // Busca todas as ordens com status "open"
    const openOrders = await Order.find({ status: 'open' }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, openOrders });
  } catch (error) {
    console.error('Erro ao buscar ordens abertas:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar ordens abertas', error: error.message });
  }
};
