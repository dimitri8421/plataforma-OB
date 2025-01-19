const SuspiciousActivity = require('../models/SuspiciousActivity'); // Modelo para registrar atividades suspeitas
const AuditLog = require('../models/AuditLog'); // Modelo para registro de logs de auditoria
const User = require('../models/User'); // Modelo de usuário para buscar informações

// Função para enviar alerta ao administrador
const alertAdmin = (userId, reason) => {
  console.log(`Alerta: Usuário ${userId} sinalizado por ${reason}`);
  // Aqui você pode enviar e-mail ou notificação para o administrador
};

// Função para registrar logs de auditoria
const recordAuditLog = async (userId, action, details) => {
  try {
    await AuditLog.create({
      userId,
      action,
      details,
      timestamp: new Date()
    });
    console.log(`Log de auditoria registrado para o usuário ${userId}: ${action}`);
  } catch (error) {
    console.error("Erro ao registrar log de auditoria:", error);
  }
};

// Função para registrar atividades suspeitas no banco de dados
const recordSuspiciousActivity = async (userId, transaction, reason) => {
  try {
    await SuspiciousActivity.create({
      userId,
      transactionId: transaction._id,
      reason,
      timestamp: new Date()
    });
    console.log(`Atividade suspeita registrada para o usuário ${userId}: ${reason}`);
    await recordAuditLog(userId, 'Atividade suspeita', reason); // Registra a atividade no log de auditoria
  } catch (error) {
    console.error("Erro ao registrar atividade suspeita:", error);
  }
};

// Função principal para verificar atividades suspeitas em uma transação
exports.checkForSuspiciousActivity = async (transaction) => {
  const { userId, amount, location } = transaction;

  try {
    const user = await User.findById(userId);

    // Regra: Transações acima de um limite específico
    if (amount > 10000) {
      alertAdmin(userId, 'Transação acima do limite');
      await recordSuspiciousActivity(userId, transaction, 'Transação acima do limite');
    }

    // Regra: Localização incomum
    if (location && user.recentLocations && !user.recentLocations.includes(location)) {
      alertAdmin(userId, 'Localização incomum detectada');
      await recordSuspiciousActivity(userId, transaction, 'Localização incomum detectada');
    }

    // Outras regras podem ser adicionadas aqui

  } catch (error) {
    console.error("Erro ao verificar atividade suspeita:", error);
  }
};
