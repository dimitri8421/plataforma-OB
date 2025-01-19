const SuspiciousActivity = require('../models/SuspiciousActivity');
const mongoose = require('mongoose');

// Função para reportar uma atividade suspeita
exports.reportSuspiciousActivity = async (req, res) => {
  const { description } = req.body;
  const userId = req.user.id;

  // Validações de entrada
  if (!description || description.trim() === '') {
    return res.status(400).json({ success: false, message: 'A descrição da atividade suspeita é obrigatória.' });
  }

  try {
    // Cria uma nova atividade suspeita
    const newActivity = new SuspiciousActivity({
      userId,
      description: description.trim(),
      status: 'reported', // Status inicial definido como 'reported'
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newActivity.save();

    res.status(201).json({ success: true, message: 'Atividade suspeita reportada com sucesso', activity: newActivity });
  } catch (error) {
    console.error('Erro ao reportar atividade suspeita:', error);
    res.status(500).json({ success: false, message: 'Erro ao reportar atividade suspeita', error: error.message });
  }
};

// Função para listar todas as atividades suspeitas (somente para administradores)
exports.listAllSuspiciousActivities = async (req, res) => {
  try {
    // Busca todas as atividades suspeitas, ordenadas pela data de criação (mais recente primeiro)
    const activities = await SuspiciousActivity.find().sort({ createdAt: -1 }).populate('userId', 'username email');

    res.status(200).json({ success: true, activities });
  } catch (error) {
    console.error('Erro ao listar atividades suspeitas:', error);
    res.status(500).json({ success: false, message: 'Erro ao listar atividades suspeitas', error: error.message });
  }
};

// Função para obter detalhes de uma atividade suspeita específica (somente para administradores)
exports.getSuspiciousActivityDetails = async (req, res) => {
  const { activityId } = req.params;

  // Validação do ID da atividade
  if (!mongoose.Types.ObjectId.isValid(activityId)) {
    return res.status(400).json({ success: false, message: 'ID de atividade inválido.' });
  }

  try {
    const activity = await SuspiciousActivity.findById(activityId).populate('userId', 'username email');

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Atividade suspeita não encontrada.' });
    }

    res.status(200).json({ success: true, activity });
  } catch (error) {
    console.error('Erro ao obter detalhes da atividade suspeita:', error);
    res.status(500).json({ success: false, message: 'Erro ao obter detalhes da atividade suspeita', error: error.message });
  }
};

// Função para atualizar o status de uma atividade suspeita (somente para administradores)
exports.updateSuspiciousActivityStatus = async (req, res) => {
  const { activityId } = req.params;
  const { status, comments } = req.body;

  // Validações dos campos obrigatórios
  if (!activityId || !status) {
    return res.status(400).json({ success: false, message: 'ID da atividade e novo status são obrigatórios.' });
  }

  if (!['reported', 'under review', 'resolved'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Status inválido. Deve ser "reported", "under review" ou "resolved".' });
  }

  try {
    // Busca a atividade e atualiza os campos fornecidos
    const activity = await SuspiciousActivity.findByIdAndUpdate(
      activityId,
      { status, comments, updatedAt: new Date() },
      { new: true }
    );

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Atividade suspeita não encontrada.' });
    }

    res.status(200).json({ success: true, message: 'Status da atividade suspeita atualizado com sucesso', activity });
  } catch (error) {
    console.error('Erro ao atualizar status da atividade suspeita:', error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar status da atividade suspeita', error: error.message });
  }
};
