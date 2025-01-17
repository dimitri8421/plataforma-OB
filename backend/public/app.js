const socket = io("http://localhost:5000", {
    transports: ["websocket"] // Força o uso de WebSocket
});

socket.on('priceUpdate', (data) => {
    document.getElementById('price').textContent = `Ativo: ${data.asset} | Preço: $${data.price.toFixed(2)} | Atualizado em: ${new Date(data.timestamp).toLocaleTimeString()}`;
});

socket.on('connect', () => {
    document.getElementById('status').textContent = 'Conectado ao servidor';
    document.getElementById('status').style.color = 'green';
    console.log('Conectado ao servidor');
});

socket.on('disconnect', () => {
    document.getElementById('status').textContent = 'Desconectado do servidor';
    document.getElementById('status').style.color = 'red';
    console.log('Desconectado do servidor');
});

socket.on('connect_error', (error) => {
    document.getElementById('status').textContent = 'Erro ao conectar ao servidor';
    document.getElementById('status').style.color = 'orange';
    console.error('Erro ao conectar:', error);
});
