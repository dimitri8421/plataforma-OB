require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Função para criar uma sessão de pagamento (depósito)
async function createDepositSession(amountInReais, successUrl, cancelUrl, userId) {
    try {
        // Converte o valor informado em reais para centavos
        const amountInCentavos = amountInReais * 100; // Exemplo: 10 reais = 1000 centavos

        // Cria a sessão de pagamento no Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'], // Tipos de pagamento aceitos
            line_items: [
                {
                    price_data: {
                        currency: 'brl', // Moeda brasileira (real)
                        product_data: {
                            name: `Depósito de ${amountInReais} reais`, // Nome do "produto" (depósito)
                        },
                        unit_amount: amountInCentavos, // Valor em centavos
                    },
                    quantity: 1, // Quantidade de unidades (sempre 1 neste caso)
                },
            ],
            mode: 'payment', // Tipo de transação (pagamento único)
            success_url: successUrl, // URL de sucesso após pagamento
            cancel_url: cancelUrl, // URL de cancelamento se o pagamento falhar
        });

        return session;
    } catch (error) {
        console.error('Erro ao criar a sessão de pagamento:', error);
        throw new Error('Erro ao criar a sessão de pagamento');
    }
}

module.exports = {
    createDepositSession
};
