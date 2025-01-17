const { Server } = require('socket.io');

function setupWebSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "*", // Permite conexões de qualquer origem
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log(`Cliente conectado: ${socket.id}`);

        // Exemplo: Enviando dados para o cliente
        setInterval(() => {
            socket.emit('priceUpdate', {
                asset: 'BTC/USDT',
                price: Math.random() * 100,
                timestamp: Date.now()
            });
        }, 5000);

        socket.on('disconnect', () => {
            console.log(`Cliente desconectado: ${socket.id}`);
        });
    });

    return io;
}

module.exports = setupWebSocket;
