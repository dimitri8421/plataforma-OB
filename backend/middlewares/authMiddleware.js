// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

/**
 * Middleware para autenticação de token JWT.
 * Verifica se o token de autorização está presente, válido e não expirou.
 */
exports.authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        
        if (!authHeader) {
            return res.status(401).json({ success: false, message: 'Acesso negado: token não fornecido.' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Acesso negado: token não encontrado no cabeçalho.' });
        }

        jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
            if (error) {
                const errorMessage = error.name === 'TokenExpiredError' 
                    ? 'Token expirado, faça login novamente.' 
                    : 'Token inválido, acesso negado.';
                return res.status(403).json({ success: false, message: errorMessage });
            }

            // Armazena o usuário autenticado na requisição para uso posterior
            req.user = user;
            next();
        });
    } catch (error) {
        console.error('Erro na autenticação do token:', error);
        return res.status(500).json({ success: false, message: 'Erro interno ao processar a autenticação.' });
    }
};

/**
 * Middleware para autorização de administradores.
 * Verifica se o usuário autenticado possui o papel de administrador.
 */
exports.authorizeAdmin = (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Acesso restrito: apenas administradores podem acessar.' });
        }
        next();
    } catch (error) {
        console.error('Erro na autorização de administrador:', error);
        return res.status(500).json({ success: false, message: 'Erro interno ao processar autorização de administrador.' });
    }
};

/**
 * Middleware para autorizar múltiplos papéis.
 * @param {...string} roles - Papéis permitidos (ex: 'admin', 'user').
 */
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        try {
            if (!req.user || !roles.includes(req.user.role)) {
                return res.status(403).json({ success: false, message: `Acesso restrito: apenas usuários com os papéis ${roles.join(', ')} podem acessar.` });
            }
            next();
        } catch (error) {
            console.error('Erro na autorização de múltiplos papéis:', error);
            return res.status(500).json({ success: false, message: 'Erro interno ao processar autorização.' });
        }
    };
};
