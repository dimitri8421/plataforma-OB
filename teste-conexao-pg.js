const { Client } = require('pg');
// Configuração de conexão com o PostgreSQL
const client = new Client({
    user: 'postgres',        // Substitua pelo seu usuário
    host: '177.153.59.51',           // Endereço do banco de dados
    database: 'postgres',     // Nome do banco de dados
    password: 'Skatesz11?',       // Senha do banco de dados
    port: 5432,                  // Porta padrão
});

async function checkCredentials(email, senha) {
    try {
        // Conectar ao banco de dados
        await client.connect();

        // Consulta SQL para verificar a existência do e-mail e senha
        const res = await client.query(
            'SELECT * FROM usuarios WHERE email = $1 AND senha = $2',
            [email, senha]
        );

        // Verificar se um usuário foi encontrado
        if (res.rows.length > 0) {
            console.log('Usuário encontrado!');
            console.log('Dados:', res.rows[0]); // Exibe os dados do usuário encontrado
        } else {
            console.log('E-mail ou senha incorretos.');
        }
    } catch (error) {
        console.error('Erro ao verificar credenciais:', error);
    } finally {
        // Fechar a conexão com o banco
        await client.end();
    }
}


async function inserir(nome, email, senha, telefone) {
    try {
        await client.connect();
        const res = await client.query(
            'INSERT INTO usuarios (nome, email, senha, telefone) VALUES ($1, $2, $3, $4) RETURNING id',
            [nome, email, senha, telefone]
        );
        console.log('Usuário inserido com ID:', res.rows[0].id);
    }
    catch (error) {
        console.error('Erro ao inserir usuário:', error);
    } finally {
        // Fechar a conexão
        await client.end();
    }

}
// Exemplo de como usar
const email = 'tes33333te@exemplo.com';
const senha = 'senha123';
inserir("Patrick", "pat323232873298327@patrick.com", "8421", "37627362372");