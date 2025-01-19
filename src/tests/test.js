const request = require('supertest');
const app = require('../server');  // Certifique-se de que o caminho para o 'server.js' está correto
const { subscribeToCandles } = require('../services/binance_service'); // Importando a função que lida com o WebSocket

describe('Example Test', () => {
    let server;
    let ws;
    let mockOnCandleUpdate;

    // Função de configuração para o mock do WebSocket
    const setupWebSocketMock = () => {
        mockOnCandleUpdate = jest.fn();

        // Criar um mock do WebSocket
        ws = {
            on: jest.fn((event, callback) => {
                if (event === 'message') {
                    // Simula o recebimento de dados com o formato esperado
                    const mockMessage = JSON.stringify({
                        k: {
                            t: 1631880200000,
                            o: '89399.99000000',
                            c: '89400.01000000',
                            h: '89418.08000000',
                            l: '89399.99000000',
                            v: '2.09658000',
                        }
                    });
                    // Dispara a função de callback com os dados simulados
                    callback(mockMessage);
                }
            }),
            emit: jest.fn(), // Não estamos mais utilizando o emit, pois a simulação é feita por 'on'
            close: jest.fn()  // Mock do método close
        };

        // Simula a assinatura ao WebSocket
        subscribeToCandles('btcusdt', '1m', mockOnCandleUpdate);
    };

    // Inicia o servidor antes dos testes
    beforeAll(async () => {
        server = app.listen(5001);  // Usando uma porta diferente para os testes
    });

    // Fecha o servidor após os testes
    afterAll(async () => {
        server.close();  // Fechar o servidor após os testes
        if (ws) {
            ws.close();  // Fechar o WebSocket após os testes
        }
    });

    it('should return 200 on root', async () => {
        // Realiza a requisição GET na raiz e valida o status da resposta
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
    });

    it('should handle WebSocket message and close correctly', async () => {
        // Configura o mock do WebSocket antes de executar o teste
        setupWebSocketMock();

        // Aguardar o processamento da mensagem no WebSocket
        await new Promise(resolve => {
            // Simulando o recebimento da mensagem do WebSocket
            ws.on('message', () => resolve());
        });

        // Verifica se o callback foi chamado corretamente
        expect(mockOnCandleUpdate).toHaveBeenCalled();
        expect(mockOnCandleUpdate).toHaveBeenCalledWith(expect.objectContaining({
            o: '89399.99000000',
            c: '89400.01000000',
            h: '89418.08000000',
            l: '89399.99000000',
        }));

        // Fechar a conexão do WebSocket após o teste
        ws.close();
    });
});
