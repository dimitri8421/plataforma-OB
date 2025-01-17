const User = require('../models/User'); // Modelo User
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator'); // Para validação das entradas

// Função para registrar um novo usuário
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  // Validação de dados de entrada
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: errors.array(),
    });
  }

  try {
    // Verificar se o usuário já existe com o e-mail
    const existingUser = await User.getUserByEmail(email); 
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Usuário já existe com este e-mail' });
    }

    // Criptografar a senha
    const hashedPassword = await bcrypt.hash(password, 12); // Aumentando a complexidade da criptografia

    // Criar o novo usuário
    const newUser = await User.createUser(username, email, hashedPassword);

    // Resposta de sucesso
    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro no servidor ao tentar registrar usuário', error: error.message });
  }
};

// Função para login de usuário
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Validação de dados de entrada
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: errors.array(),
    });
  }

  try {
    // Verificar se o usuário existe
    const user = await User.getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ success: false, message: 'Usuário não encontrado' });
    }

    // Comparar a senha fornecida com a senha criptografada
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: 'Senha incorreta' });
    }

    // Criar um token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },  // Adicionando o role no payload
      process.env.JWT_SECRET,  // Secret key para o token
      { expiresIn: '1h' }  // Expiração do token em 1 hora
    );

    // Resposta de login bem-sucedido com o token JWT
    res.status(200).json({
      success: true,
      message: 'Login bem-sucedido',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro no servidor ao tentar fazer login', error: error.message });
  }
};

// Middleware para verificar o token
exports.verifyToken = (req, res, next) => {
  const token = req.header('x-auth-token') || req.header('Authorization')?.split(' ')[1];

  // Verificar se o token está presente
  if (!token) {
    return res.status(401).json({ success: false, message: 'Acesso negado. Nenhum token fornecido.' });
  }

  // Verificar se o token é válido
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Armazenar os dados do usuário no objeto `req`
    next();  // Passa para o próximo middleware ou controlador
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: 'Token inválido', error: error.message });
  }
};
