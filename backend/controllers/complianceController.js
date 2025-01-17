const Compliance = require('../models/Compliance');
const mongoose = require('mongoose');

// Função para verificar o status de compliance de um usuário específico
exports.checkComplianceStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    // Busca o status de compliance do usuário logado
    const complianceStatus = await Compliance.findOne({ userId });

    if (!complianceStatus) {
      return res.status(404).json({ success: false, message: 'Status de compliance não encontrado para este usuário.' });
    }

    res.status(200).json({ success: true, complianceStatus });
  } catch (error) {
    console.error("Erro ao verificar status de compliance:", error);
    res.status(500).json({ success: false, message: 'Erro ao verificar status de compliance' });
  }
};

// Função para atualizar o status de compliance de um usuário (somente para administradores)
exports.updateComplianceStatus = async (req, res) => {
  const { userId, status, level, comments } = req.body;

  // Validação dos campos obrigatórios
  if (!userId || !status || !['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Campos obrigatórios ausentes ou inválidos (userId, status).' });
  }

  if (level && !['basic', 'enhanced'].includes(level)) {
    return res.status(400).json({ success: false, message: 'Nível de compliance inválido. Deve ser "basic" ou "enhanced".' });
  }

  try {
    // Busca o registro de compliance do usuário
    const compliance = await Compliance.findOneAndUpdate(
      { userId },
      { status, level, comments, updatedAt: new Date() },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, message: 'Status de compliance atualizado com sucesso', compliance });
  } catch (error) {
    console.error("Erro ao atualizar status de compliance:", error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar status de compliance' });
  }
};

// Função para listar todos os usuários com status de compliance (somente para administradores)
exports.listComplianceStatuses = async (req, res) => {
  try {
    // Busca todos os registros de compliance, populando o campo userId com dados do usuário
    const complianceList = await Compliance.find().populate('userId', 'username email');

    res.status(200).json({ success: true, complianceList });
  } catch (error) {
    console.error("Erro ao listar status de compliance:", error);
    res.status(500).json({ success: false, message: 'Erro ao listar status de compliance' });
  }
};

// Função para obter detalhes do compliance de um usuário específico (somente para administradores)
exports.getComplianceDetails = async (req, res) => {
  const { userId } = req.params;

  // Validação do ID de usuário
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ success: false, message: 'ID de usuário inválido.' });
  }

  try {
    // Busca o status de compliance específico do usuário fornecido
    const compliance = await Compliance.findOne({ userId }).populate('userId', 'username email');

    if (!compliance) {
      return res.status(404).json({ success: false, message: 'Compliance não encontrado para este usuário.' });
    }

    res.status(200).json({ success: true, compliance });
  } catch (error) {
    console.error("Erro ao obter detalhes de compliance:", error);
    res.status(500).json({ success: false, message: 'Erro ao obter detalhes de compliance' });
  }
};
