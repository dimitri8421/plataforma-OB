const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Importa a biblioteca bcryptjs para comparar senhas
const User = require('../models/User');  // Para acessar o modelo de usuários e suas permissões
const { body, validationResult } = require('express-validator'); // Para validar as entradas

// Middleware para verificar a autenticidade do token JWT
exports.authenticateToken = (request, response, next) => {
  const token = request.header('x-auth-token') || request.header('Authorization')?.split(' ')[1];

  if (!token) {
    return response.status(401).json({
      success: false,
      message: 'Acesso negado. Nenhum token foi fornecido para autenticação.'
    });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    request.user = decodedToken;
    next();
  } catch (error) {
    console.error('Erro ao verificar o token JWT:', error);
    return response.status(400).json({
      success: false,
      message: 'O token fornecido é inválido ou expirado.',
      error: error.message
    });
  }
};

// Middleware para verificar a permissão de acesso com base no role do usuário
exports.authorizeRole = (...allowedRoles) => {
  return (request, response, next) => {
    if (!request.user || !request.user.role) {
      return response.status(403).json({
        success: false,
        message: 'Acesso negado. Nenhum role encontrado para o usuário.'
      });
    }

    if (!allowedRoles.includes(request.user.role)) {
      return response.status(403).json({
        success: false,
        message: 'Acesso negado. Você não tem permissão para acessar esta rota com o seu role.'
      });
    }

    next();
  };
};

// Função para registrar um novo usuário (com senha hashada)
exports.registerUser = [
  // Validações
  body('email').isEmail().withMessage('Por favor, insira um email válido').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('A senha deve ter no mínimo 6 caracteres').matches(/\d/).withMessage('A senha deve conter pelo menos um número'),
  body('username').notEmpty().withMessage('Nome de usuário é obrigatório'),

  async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({
        success: false,
        message: 'Erro na validação dos dados de entrada',
        errors: errors.array()
      });
    }

    const { email, password, username } = request.body;

    try {
      // Verifica se o usuário já existe no banco de dados
      const userExists = await User.findOne({ email });
      if (userExists) {
        return response.status(400).json({
          success: false,
          message: 'Usuário já existe com este email.'
        });
      }

      // Criptografa a senha antes de armazená-la no banco de dados
      const hashedPassword = await bcrypt.hash(password, 10);  // 10 é o saltRounds

      // Cria o novo usuário no banco de dados
      const newUser = await User.create({
        email,
        password: hashedPassword,
        username,
        role: 'user'  // O role pode ser 'user', 'admin', etc.
      });

      return response.status(201).json({
        success: true,
        message: 'Usuário registrado com sucesso.',
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username
        }
      });
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      return response.status(500).json({
        success: false,
        message: 'Erro ao registrar usuário.',
        error: error.message
      });
    }
  }
];

// Função para login de um usuário
exports.loginUser = async (request, response) => {
  const { email, password } = request.body;

  if (!email || !password) {
    return response.status(400).json({
      success: false,
      message: 'Por favor, forneça email e senha para login.'
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return response.status(400).json({
        success: false,
        message: 'Usuário não encontrado.'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return response.status(400).json({
        success: false,
        message: 'Senha incorreta.'
      });
    }

    // Se a senha for válida, gera um token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return response.status(200).json({
      success: true,
      message: 'Login bem-sucedido.',
      token
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return response.status(500).json({
      success: false,
      message: 'Erro ao realizar login.',
      error: error.message
    });
  }
};
