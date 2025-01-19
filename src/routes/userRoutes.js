// userRoutes.js
const express = require('express');
const {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
} = require('../controllers/userController');
const { authenticateToken, authorizeAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * Rota para listar todos os usuários
 * Disponível apenas para administradores
 */
router.get('/', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const users = await getAllUsers();
        res.status(200).json({ success: true, message: 'Lista de usuários recuperada com sucesso.', users });
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ success: false, message: 'Erro interno ao tentar listar usuários.' });
    }
});

/**
 * Rota para obter detalhes de um usuário específico
 * Disponível apenas para administradores
 */
router.get('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const user = await getUserById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
        }
        res.status(200).json({ success: true, message: 'Detalhes do usuário recuperados com sucesso.', user });
    } catch (error) {
        console.error(`Erro ao obter detalhes do usuário com ID ${id}:`, error);
        res.status(500).json({ success: false, message: 'Erro interno ao tentar obter detalhes do usuário.' });
    }
});

/**
 * Rota para atualizar dados de um usuário específico
 * Disponível apenas para administradores
 */
router.put('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    const { id } = req.params;
    const { username, email, role } = req.body;

    try {
        const updatedUser = await updateUser(id, { username, email, role });
        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
        }
        res.status(200).json({ success: true, message: 'Dados do usuário atualizados com sucesso.', user: updatedUser });
    } catch (error) {
        console.error(`Erro ao atualizar dados do usuário com ID ${id}:`, error);
        res.status(500).json({ success: false, message: 'Erro interno ao tentar atualizar dados do usuário.' });
    }
});

/**
 * Rota para excluir um usuário específico
 * Disponível apenas para administradores
 */
router.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const deleted = await deleteUser(id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
        }
        res.status(200).json({ success: true, message: 'Usuário excluído com sucesso.' });
    } catch (error) {
        console.error(`Erro ao excluir usuário com ID ${id}:`, error);
        res.status(500).json({ success: false, message: 'Erro interno ao tentar excluir usuário.' });
    }
});

module.exports = router;
