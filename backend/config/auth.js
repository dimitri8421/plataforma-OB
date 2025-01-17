const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');  // A versão bcryptjs é mais adequada para compatibilidade com Node.js moderno
const pool = require('./db'); // Conexão com o banco de dados

// Chave secreta para assinar os tokens JWT
const SECRET_KEY = process.env.JWT_SECRET || 'seuSegredoAqui';

// Função para gerar o token JWT
function generateToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email },  // Inclui id e email no payload do token
        SECRET_KEY,  // A chave secreta para assinar o token
        { expiresIn: '1h' }  // Token expira após 1 hora
    );
}

// Função para autenticar o token enviado no header
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];  // Obtém o header de autorização
    const token = authHeader && authHeader.split(' ')[1];  // O token estará no formato "Bearer token"

    if (!token) {
        return res.status(401).json({ message: 'Token não encontrado, acesso negado.' });
    }

    // Verifica a validade do token
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token inválido, acesso negado.' });
        req.user = user;  // Armazena o usuário do token no req.user
        next();  // Chama o próximo middleware ou a rota
    });
}

// Função para registrar um novo usuário
async function registerUser(req, res) {
    const { email, password } = req.body;

    try {
        // Hash da senha antes de armazená-la
        const hashedPassword = await bcrypt.hash(password, 10);  // O número 10 é o saltRounds

        // Conexão com o banco para inserir o usuário
        const connection = await pool.getConnection();
        const [result] = await connection.query(
            'INSERT INTO Users (email, password) VALUES (?, ?)',  // Query para inserir o usuário
            [email, hashedPassword]
        );
        connection.release();

        // Resposta de sucesso
        res.status(201).json({ message: 'Usuário registrado com sucesso' });
    } catch (error) {
        // Resposta de erro caso algo dê errado
        res.status(500).json({ message: 'Erro ao registrar usuário', error });
    }
}

// Função para realizar o login do usuário
async function loginUser(req, res) {
    const { email, password } = req.body;

    try {
        // Conexão com o banco para buscar o usuário pelo email
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM Users WHERE email = ?', [email]);
        connection.release();

        // Se o usuário não for encontrado
        if (rows.length === 0) return res.status(400).json({ message: 'Usuário não encontrado' });

        const user = rows[0];
        
        // Verifica se a senha fornecida é válida
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(400).json({ message: 'Senha incorreta' });

        // Se a senha for válida, gera o token e o envia
        const token = generateToken(user);
        res.json({ token });
    } catch (error) {
        // Resposta de erro em caso de falha no login
        res.status(500).json({ message: 'Erro ao realizar login', error });
    }
}

// Exportação das funções para que possam ser usadas em outros arquivos
module.exports = {
    generateToken,
    authenticateToken,
    registerUser,
    loginUser
};
