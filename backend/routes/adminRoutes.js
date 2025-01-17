// routes/adminRoutes.js
const express = require('express');
const {
    createUser,
    getAllUsers,
    updateUserRole,
    deleteUser
} = require('../controllers/adminController');
const { authenticateToken, authorizeAdmin } = require('../middlewares/authMiddleware');
const { body, param, validationResult } = require('express-validator');

const router = express.Router();

/**
 * Rota para criar um novo usuário
 * Disponível apenas para administradores
 */
router.post(
    '/user',
    authenticateToken,
    authorizeAdmin,
    [
        body('username').notEmpty().withMessage('O campo username é obrigatório.').isString().withMessage('username deve ser uma string.'),
        body('email').notEmpty().withMessage('O campo email é obrigatório.').isEmail().withMessage('email deve ser válido.'),
        body('password').notEmpty().withMessage('O campo password é obrigatório.').isLength({ min: 6 }).withMessage('password deve ter pelo menos 6 caracteres.')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        try {
            await createUser(req, res);
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            res.status(500).json({ success: false, message: 'Erro interno ao tentar criar usuário.' });
        }
    }
);

/**
 * Rota para listar todos os usuários
 * Disponível apenas para administradores
 */
router.get(
    '/users',
    authenticateToken,
    authorizeAdmin,
    async (req, res) => {
        try {
            await getAllUsers(req, res);
        } catch (error) {
            console.error('Erro ao listar usuários:', error);
            res.status(500).json({ success: false, message: 'Erro interno ao tentar listar usuários.' });
        }
    }
);

/**
 * Rota para atualizar o papel de um usuário específico
 * Disponível apenas para administradores
 */
router.put(
    '/user/:id/role',
    authenticateToken,
    authorizeAdmin,
    [
        param('id').isInt().withMessage('ID do usuário deve ser um número inteiro.'),
        body('role').notEmpty().withMessage('O campo role é obrigatório.').isIn(['user', 'admin']).withMessage('role deve ser "user" ou "admin".')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        try {
            await updateUserRole(req, res);
        } catch (error) {
            console.error('Erro ao atualizar papel do usuário:', error);
            res.status(500).json({ success: false, message: 'Erro interno ao tentar atualizar papel do usuário.' });
        }
    }
);

/**
 * Rota para excluir um usuário específico
 * Disponível apenas para administradores
 */
router.delete(
    '/user/:id',
    authenticateToken,
    authorizeAdmin,
    [param('id').isInt().withMessage('ID do usuário deve ser um número inteiro.')],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        try {
            await deleteUser(req, res);
        } catch (error) {
            console.error('Erro ao excluir usuário:', error);
            res.status(500).json({ success: false, message: 'Erro interno ao tentar excluir usuário.' });
        }
    }
);

module.exports = router;
