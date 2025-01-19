const { getAllUsers, getUserById, updateUserById, deleteUserById, changeUserRole } = require('../models/User');

// Função para listar todos os usuários (somente para administradores)
exports.listAllUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ success: false, message: 'Erro ao listar usuários' });
  }
};

// Função para obter detalhes de um usuário específico (somente para administradores)
exports.getUserDetails = async (req, res) => {
  const { userId } = req.params;

  // Validação do ID do usuário
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ success: false, message: 'ID do usuário inválido.' });
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Erro ao obter detalhes do usuário:', error);
    res.status(500).json({ success: false, message: 'Erro ao obter detalhes do usuário' });
  }
};

// Função para atualizar um usuário específico (somente para administradores)
exports.updateUser = async (req, res) => {
  const { userId } = req.params;
  const { username, email, role } = req.body;

  // Validação de entrada
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ success: false, message: 'ID do usuário inválido.' });
  }
  if (role && !['user', 'admin'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Papel do usuário inválido.' });
  }

  try {
    const updatedUser = await updateUserById(userId, { username, email, role });
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    }
    res.status(200).json({ success: true, message: 'Usuário atualizado com sucesso', user: updatedUser });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar usuário' });
  }
};

// Função para excluir um usuário específico (somente para administradores)
exports.deleteUser = async (req, res) => {
  const { userId } = req.params;

  // Validação do ID do usuário
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ success: false, message: 'ID do usuário inválido.' });
  }

  try {
    const deleted = await deleteUserById(userId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    }
    res.status(200).json({ success: true, message: 'Usuário excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ success: false, message: 'Erro ao excluir usuário' });
  }
};

// Função para alterar o papel de um usuário específico (somente para administradores)
exports.changeUserRole = async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  // Validação de entrada
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ success: false, message: 'ID do usuário inválido.' });
  }
  if (!role || !['user', 'admin'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Papel do usuário inválido. Deve ser "user" ou "admin".' });
  }

  try {
    const updatedUser = await changeUserRole(userId, role);
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    }
    res.status(200).json({ success: true, message: 'Papel do usuário atualizado com sucesso', user: updatedUser });
  } catch (error) {
    console.error('Erro ao alterar papel do usuário:', error);
    res.status(500).json({ success: false, message: 'Erro ao alterar papel do usuário' });
  }
};
