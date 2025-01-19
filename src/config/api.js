const jwt = require('jsonwebtoken');

// Chave secreta para assinatura de tokens
const SECRET_KEY = process.env.JWT_SECRET || 'seuSegredoAqui';

// Função para gerar tokens JWT
function generateToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email }, 
        SECRET_KEY, 
        { expiresIn: '1h' } // Token válido por 1 hora
    );
}

// Middleware para verificar a autenticidade do token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token não encontrado, acesso negado.' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token inválido, acesso negado.' });
        req.user = user;
        next();
    });
}

module.exports = {
    generateToken,
    authenticateToken
};
