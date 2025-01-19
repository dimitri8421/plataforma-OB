require('dotenv').config(); // Carregar variáveis de ambiente do arquivo .env
const http = require('http'); // Importa o módulo HTTP
const { Server } = require('socket.io'); // Importa o Socket.IO
const express = require('express');
const bcrypt = require('bcryptjs');
const path = require('path'); // Importado para servir arquivos estáticos
const { authenticateToken } = require('./src/config/auth'); // Middleware para autenticar token
const pool = require('./src/config/db'); // Configuração do PostgreSQL
const { subscribeToCandles } = require('./src/services/binance_service');
const cors = require('cors'); // Para gerenciar CORS
const morgan = require('morgan'); // Para logging de requisições HTTP
const rateLimit = require('express-rate-limit'); // Limitação de taxa
const setupWebSocket = require('./src/config/websocket');
const allRoutes = require('./src/allRoutes');

const app = express();
const server = http.createServer(app); // Criação do servidor HTTP com Express
const io = new Server(server); // Inicializa o Socket.IO com o servidor HTTP

app.use(express.json());
app.use(express.static('public'));

// Configuração do CORS
app.use(cors({
    origin: ['http://localhost:3000', 'https://seu-dominio.com'], // Liste os domínios permitidos
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

// Configuração do Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Limita a 100 requisições por IP
    message: 'Muitas requisições, tente novamente mais tarde.',
});
app.use(limiter);

io.on('connection', (socket) => {
  console.log('Um usuário conectou:', socket.id);

  // Eventos do socket devem estar aqui, se houver
});

// Configuração do Rate Limiting (fora do bloco io.on)
app.use(limiter);


const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
    app.use(morgan('tiny')); // Logs mais leves para produção
} else {
    app.use(morgan('combined')); // Logs detalhados para desenvolvimento
}

// Certifique-se de que a variável de ambiente JWT_SECRET existe
if (!process.env.JWT_SECRET) {
  console.error('Erro: A variável de ambiente JWT_SECRET não foi configurada.');
  process.exit(1); // Encerra o servidor se a variável JWT_SECRET estiver ausente
}

// Configuração para servir arquivos estáticos do front-end
app.use(express.static(path.join(__dirname, 'frontend', 'public')));

const PORT = process.env.PORT || 5000;
const candles = [];

// Rota para conectar o front-end ao back-end
app.get('/api/connect', (req, res) => {
  res.status(200).json({ message: 'Conexão com o back-end bem-sucedida!' });
});

// Função de callback para manipular os dados de candle recebidos em tempo real
function handleCandleUpdate(candle) {
  const isCandleClosed = candle.x;

  if (isCandleClosed) {
    const data = {
      open: candle.o,
      close: candle.c,
      high: candle.h,
      low: candle.l,
      volume: candle.v,
      timestamp: new Date(candle.t).toISOString(),
    };

    candles.push(data); // Armazena apenas candles fechados
    console.log('Candle fechado:', data);
  }
}

io.on('connection', (socket) => {
  console.log('Um usuário conectou:', socket.id);

  socket.on('mensagem', (msg) => {
      console.log('Mensagem recebida:', msg);
      io.emit('mensagem', msg); // Envia a mensagem para todos os clientes conectados
  });

  socket.on('disconnect', () => {
      console.log('Um usuário desconectou');
  });

  // Outros eventos podem ser adicionados aqui
});

  // Limitar reconexões (se necessário)
  io.on('connection', (socket) => {
    console.log('Um usuário conectou:', socket.id);

    socket.on('mensagem', (msg) => {
        console.log('Mensagem recebida:', msg);
        io.emit('mensagem', msg); // Envia a mensagem para todos os clientes conectados
    });

    socket.conn.on('packet', (packet) => {
        if (packet.type === 'ping') {
            socket.reconnectionAttempts = (socket.reconnectionAttempts || 0) + 1;
            if (socket.reconnectionAttempts > 5) {
                console.warn(`Cliente ${socket.id} desconectado por excesso de tentativas.`);
                socket.disconnect(true);
            }
        }
    });

    socket.on('disconnect', () => {
        console.log('Um usuário desconectou');
    });
});
  // Outros eventos podem ser adicionados aqui...
;

app.get('/api', (req, res) => {
  res.status(200).json({ message: 'Conexão com o back-end bem-sucedida!' });
});


// Inicia a assinatura no WebSocket da Binance e captura erros de conexão
subscribeToCandles('btcusdt', '1m', handleCandleUpdate)
  .then(() => console.log('Conectado ao WebSocket da Binance para BTC/USDT'))
  .catch((error) => console.error('Erro ao conectar ao WebSocket da Binance:', error.message));

// Rota para a raiz (/)
app.get('/', (req, res) => {
  res.status(200).send('Servidor está funcionando');
});

app.use(allRoutes)

// Rota para obter dados de candles - protegida com authenticateToken
app.get('/api/candles', authenticateToken, (req, res) => {
  try {
    res.status(200).json({ candles });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter dados de candles' });
  }
});

// Rota para cadastrar um novo usuário
app.post('/api/usuarios', async (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
  }

  const hashedPassword = await bcrypt.hash(senha, 10);

  const query = 'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING id';
  try {
    const result = await pool.query(query, [nome, email, hashedPassword]);
    res.status(201).json({ id: result.rows[0].id, nome, email });
  } catch (error) {
    console.error('Erro ao inserir usuário:', error.message);
    res.status(500).json({ error: 'Erro ao inserir usuário no banco de dados' });
  }
});

// Rota para listar todos os usuários
app.get('/api/usuarios', authenticateToken, async (req, res) => {
  const query = 'SELECT * FROM usuarios';
  try {
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar usuários:', error.message);
    res.status(500).json({ error: 'Erro ao obter lista de usuários' });
  }
});

// Rota para criar contas (real e demo)
app.post('/api/accounts/create-accounts', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const query = `
    INSERT INTO contas (usuario_id, tipo_conta, saldo)
    VALUES ($1, 'real', 0), ($1, 'demo', 1000)
    ON CONFLICT (usuario_id, tipo_conta) DO NOTHING;
  `;

  try {
    await pool.query(query, [userId]);
    res.status(201).json({ message: 'Contas criadas com sucesso!' });
  } catch (error) {
    console.error('Erro ao criar contas:', error.message);
    res.status(500).json({ error: 'Erro ao criar contas' });
  }
});

// Rota para depósito na conta real
app.post('/api/accounts/deposit', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { amount } = req.body;

  // Validação do valor do depósito
  if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valor de depósito inválido' });
  }

  const query = `
      UPDATE contas SET saldo = saldo + $1
      WHERE usuario_id = $2 AND tipo_conta = 'real'
      RETURNING saldo;
  `;

  try {
      // Execução da query assíncrona
      const result = await pool.query(query, [amount, userId]);

      if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Conta não encontrada' });
      }

      // Sucesso
      res.status(200).json({
          message: 'Depósito realizado com sucesso',
          saldo: result.rows[0].saldo,
      });
  } catch (error) {
      // Erro durante o processo
      console.error('Erro ao realizar depósito:', error);
      res.status(500).json({ error: 'Erro ao realizar depósito' });
  }
});

// Middleware de erro geral
app.use((err, req, res, next) => {
  console.error('Erro inesperado:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Configura o WebSocket
setupWebSocket(server);

// Inicializa o servidor HTTP
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
