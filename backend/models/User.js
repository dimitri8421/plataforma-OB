const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs'); // Para hash de senha

// Configuração da pool de conexões MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Função para validar os dados do usuário
const validateUserData = (username, email, password) => {
  if (!username || !email || !password) {
    throw new Error('Todos os campos (username, email, password) são obrigatórios');
  }
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!emailRegex.test(email)) {
    throw new Error('O email fornecido é inválido');
  }
};

// Função para criar um novo usuário
const createUser = async (username, email, password) => {
  try {
    // Validação de dados
    validateUserData(username, email, password);
    
    // Criptografar a senha
    const hashedPassword = await bcrypt.hash(password, 12);

    const query = 'INSERT INTO Users (username, email, password) VALUES (?, ?, ?)';
    const values = [username, email, hashedPassword];

    const [result] = await pool.query(query, values);

    // Retorna o usuário criado, incluindo o id gerado
    return { id: result.insertId, username, email };
  } catch (error) {
    console.error('Erro ao criar usuário:', error.message);
    throw new Error('Erro ao criar o usuário');
  }
};

// Função para buscar todos os usuários
const getAllUsers = async () => {
  const query = 'SELECT id, username, email, role FROM Users ORDER BY createdAt DESC';
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
  const query = 'SELECT id, username, email, password, role FROM Users WHERE email = ?';
  try {
    const [results] = await pool.query(query, [email]);
    if (results.length === 0) {
      console.warn(`Usuário não encontrado para o email: ${email}`);
    }
    return results[0] || null;  // Retorna o primeiro usuário encontrado ou null
  } catch (error) {
    console.error('Erro ao buscar usuário por email:', error.message);
    throw new Error('Erro ao buscar usuário');
  }
};

// Função para buscar um usuário por ID
const getUserById = async (userId) => {
  const query = 'SELECT id, username, email, role FROM Users WHERE id = ?';
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
  const { username, email, role } = userData;
  
  // Validação de dados
  validateUserData(username, email, userData.password || '');

  const query = `
    UPDATE Users SET username = ?, email = ?, role = ?, updatedAt = NOW() 
    WHERE id = ?`;
  const values = [username, email, role, userId];

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
  const query = 'DELETE FROM Users WHERE id = ?';
  try {
    const [result] = await pool.query(query, [userId]);
    return result.affectedRows > 0;  // Retorna true se a exclusão for bem-sucedida
  } catch (error) {
    console.error('Erro ao excluir usuário:', error.message);
    throw new Error('Erro ao excluir o usuário');
  }
};

// Função para autenticar usuário (verificar a senha)
const authenticateUser = async (email, password) => {
  try {
    const user = await getUserByEmail(email);  // Verifica se o usuário existe pelo e-mail
    if (!user) {
      console.warn(`Usuário não encontrado para o email: ${email}`);
      return null;  // Retorna null caso o usuário não seja encontrado
    }

    // Compara a senha fornecida com a senha armazenada (criptografada)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
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
