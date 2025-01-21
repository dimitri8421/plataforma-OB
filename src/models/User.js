const bcrypt = require('bcryptjs'); // Para hash de senha

const pool = require('../config/db');  // Importa a conexão com o banco de dados

// Função para validar os dados do usuário
const validateUserData = (nome, email, senha, telefone) => {
  if (!nome || !email || !senha || !telefone) {
    throw new Error('Todos os campos (nome, email, senha, telefone) são obrigatórios');
  }
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!emailRegex.test(email)) {
    throw new Error('O email fornecido é inválido');
  }
};

// Função para criar um novo usuário
const createUser = async (nome, email, senha, telefone) => {
  try {
    // Validação de dados
    validateUserData(nome, email, senha, telefone);
    
    // Criptografar a senha
    const senhaCriptografada = await bcrypt.hash(senha, 12);

    const query = 'INSERT INTO usuarios (nome, email, senha, telefone) VALUES (?, ?, ?, ?)';
    const values = [nome, email, senhaCriptografada, telefone];

    const [result] = await pool.query(query, values);

    // Retorna o usuário criado, incluindo o id gerado
    return { id: result.insertId, nome, email,telefone };
  } catch (error) {
    console.error('Erro ao criar usuário:', error.message);
    throw new Error('Erro ao criar o usuário');
  }
};

// Função para buscar todos os usuários
const getAllUsers = async () => {
  const query = 'SELECT id, nome, email,  telefone FROM usuarios ORDER BY createdAt DESC';
  try {
    const [results] = await pool.query(query);
    return results;
  } catch (error) {
    console.error('Erro ao buscar todos os usuários:', error.message);
    throw new Error('Erro ao buscar os usuários');
  }
};

// Função para buscar um usuário por email
const getUserByEmail = async (email) => {
  const query = 'SELECT id, nome, email, senha,  telefone FROM usuarios WHERE email = $1';
  try {
    const results = await pool.query(query, [email]);
    if (results.rows.length === 0) {
      console.warn(`Usuário não encontrado para o email: ${email}`);
    }
    return results.rows[0] || null;  // Retorna o primeiro usuário encontrado ou null
  } catch (error) {
    console.error('Erro ao buscar usuário por email:', error);
    throw new Error('Erro ao buscar usuário');
  }
};

// Função para buscar um usuário por ID
const getUserById = async (userId) => {
  const query = 'SELECT id, nome, email, telefone FROM usuarios WHERE id = ?';
  try {
    const [results] = await pool.query(query, [userId]);
    return results[0] || null;  // Retorna o usuário encontrado ou null
  } catch (error) {
    console.error('Erro ao buscar usuário por ID:', error.message);
    throw new Error('Erro ao buscar usuário');
  }
};

// Função para atualizar dados de um usuário específico
const updateUserById = async (userId, userData) => {
  const { nome, email,  telefone } = userData;
  
  // Validação de dados
  validateUserData(nome, email, userData.senha || '');

  const query = `
    UPDATE usuarios SET nome = ?, email = ?,  telefone = ?, updatedAt = NOW() 
    WHERE id = ?`;
  const values = [nome, email,  telefone, userId];

  try {
    const [result] = await pool.query(query, values);
    if (result.affectedRows === 0) return null;  // Se nenhuma linha for afetada, retorna null
    return await getUserById(userId);  // Retorna o usuário atualizado
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error.message);
    throw new Error('Erro ao atualizar o usuário');
  }
};

// Função para excluir um usuário
const deleteUserById = async (userId) => {
  const query = 'DELETE FROM usuarios WHERE id = ?';
  try {
    const [result] = await pool.query(query, [userId]);
    return result.affectedRows > 0;  // Retorna true se a exclusão for bem-sucedida
  } catch (error) {
    console.error('Erro ao excluir usuário:', error.message);
    throw new Error('Erro ao excluir o usuário');
  }
};

// Função para autenticar usuário (verificar a senha)
const authenticateUser = async (email, senha) => {
  try {
    const user = await getUserByEmail(email);  // Verifica se o usuário existe pelo e-mail
    if (!user) {
      console.warn(`Usuário não encontrado para o email: ${email}`);
      return null;  // Retorna null caso o usuário não seja encontrado
    }

    // Compara a senha fornecida com a senha armazenada (criptografada)
    const issenhaValid = await bcrypt.compare(senha, user.senha);
    if (!issenhaValid) {
      console.warn(`Senha incorreta para o email: ${email}`);
      return null;  // Retorna null se a senha for inválida
    }
  
    return user;  // Retorna o usuário autenticado se a senha for válida
  } catch (error) {
    console.error('Erro ao autenticar usuário:', error.message);
    throw new Error('Erro ao autenticar o usuário');
  }
};

// Função para validar se o email já existe no banco
const emailExists = async (email) => {
  const user = await getUserByEmail(email);
  return user !== null;
};

// Exporta todas as funções para uso no controlador
module.exports = {
  createUser,
  getAllUsers,
  getUserByEmail,
  getUserById,
  updateUserById,
  deleteUserById,
  authenticateUser,
  emailExists
};
