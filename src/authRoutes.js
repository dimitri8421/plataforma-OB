const express = require('express');
const { register, login, verifyToken } = require('./controllers/authController');

const router = express.Router();

// Rota de registro
router.post('/register', register);

// Rota de login
router.post('/login', login);

// Rota protegida de exemplo
router.get('/protected', verifyToken, (req, res) => {
  res.status(200).json({ message: 'Acesso autorizado' });
});

module.exports = router;
