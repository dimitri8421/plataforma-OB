// controllers/userController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');  // Importando JWT para gerar o token

// Função para registrar um novo usuário (sem criptografar a senha)
exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  // Validação dos dados de entrada
  if (!email || !password || !username) {
    return res.status(400).json({
      success: false,
      message: 'Por favor, forneça email, senha e nome de usuário.'
    });
  }

  try {
    // Verifica se o usuário já existe no banco
    const userExists = await User.emailExists(email);
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Usuário já existe com este e-mail.'
      });
    }

    // Criação do usuário sem criptografar a senha
    const newUser = await User.createUser(username, email, password);  // Aqui a senha é armazenada em texto simples

    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso.',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar o usuário.',
      error: error.message
    });
  }
};

// Função de login de um usuário (sem criptografar a senha)
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Valida as entradas de dados
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Por favor, forneça email e senha para login.'
    });
  }

  try {
    // Tenta buscar o usuário no banco de dados
    const user = await User.getUserByEmail(email);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Usuário não encontrado.'
      });
    }

    // Verifica se a senha fornecida corresponde à senha armazenada (sem criptografia)
    if (password !== user.password) {
      return res.status(400).json({
        success: false,
        message: 'Senha incorreta.'
      });
    }

    // Se a senha for válida, gera o token JWT
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Responde com o token de autenticação
    res.status(200).json({
      success: true,
      message: 'Login bem-sucedido.',
      token
    });
  } catch (error) {
    console.error('Erro ao realizar login:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao realizar o login.',
      error: error.message
    });
  }
};
