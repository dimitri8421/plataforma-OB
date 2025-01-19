const express = require('express');
const { register, login, verifyToken } = require('../controllers/authController');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db'); // Pool de conexão com o banco de dados

const router = express.Router();

// Middleware para capturar e tratar erros de forma centralizada
const handleErrors = (err, res) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: 'Erro interno ao processar a requisição.',
    error: err.message,
  });
};

/**
 * Rota para registrar um novo usuário
 * Acessível por qualquer usuário
 */
router.post('/register', 
  [
    body('email')
      .isEmail().withMessage('Por favor, insira um e-mail válido.')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres.')
      .matches(/\d/).withMessage('A senha deve conter pelo menos um número.')
      .matches(/[A-Za-z]/).withMessage('A senha deve conter pelo menos uma letra.'),
    body('username')
      .notEmpty().withMessage('O nome de usuário é obrigatório.')
      .trim()
  ], 
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos.',
        errors: errors.array()
      });
    }

    try {
      await register(req, res);
    } catch (error) {
      handleErrors(error, res);
    }
});

/**
 * Rota para login de usuário
 * Retorna um token JWT se as credenciais estiverem corretas
 */
router.post('/login', 
  [
    body('email').isEmail().withMessage('Por favor, insira um e-mail válido'),
    body('password').notEmpty().withMessage('A senha é obrigatória')
  ], 
  async (req, res) => {

    console.log("Entrou no login");
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos.',
        errors: errors.array()
      });
    }

    try {
      await login(req, res);
    } catch (error) {
      handleErrors(error, res);
    }
});

/**
 * Rota para criar um novo usuário (somente usuários autenticados)
 */
router.post('/usuarios', authenticateToken, async (req, res) => {
  const { nome, email, senha } = req.body;

  // Validação dos dados de entrada
  if (!nome || !email || !senha) {
    return res.status(400).json({
      success: false,
      message: 'Nome, email e senha são obrigatórios.'
    });
  }

  const query = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.query(query, [nome, email, senha]);
    connection.release();
    res.status(201).json({ success: true, id: results.insertId, nome, email });
  } catch (error) {
    handleErrors(error, res);
  }
});

/**
 * Rota para listar usuários
 * Requer autenticação para acessar
 */
router.get('/usuarios', authenticateToken, async (req, res) => {
  const query = 'SELECT * FROM usuarios';
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.query(query);
    connection.release();
    res.status(200).json({ success: true, usuarios: results });
  } catch (error) {
    handleErrors(error, res);
  }
});

/**
 * Rota protegida para acessar os dados do usuário
 * Requer autenticação para acesso
 */
router.get('/profile', authenticateToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Perfil do usuário',
    user: req.user  // Dados do usuário extraídos do token
  });
});

/**
 * Rota protegida para admins (somente usuários com a role 'admin' podem acessar)
 */
router.get('/admin', authenticateToken, authorizeRole('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Acesso autorizado, você é um administrador!',
    user: req.user
  });
});

/**
 * Rota para verificar a validade do token do usuário
 * Requer autenticação
 */
router.get('/verify', authenticateToken, async (req, res) => {
    try {
        await verifyToken(req, res);
    } catch (error) {
        handleErrors(error, res);
    }
});

module.exports = router;
