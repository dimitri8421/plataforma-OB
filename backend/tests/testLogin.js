const { authenticateUser } = require('./user');  // Importe a função de autenticação

async function testLogin() {
  const email = 'dionesemail@usuario.com';
  const password = 'senha123';

  if (!email || !password) {
    console.error('Erro: Email e senha são obrigatórios!');
    return;
  }

  try {
    const user = await authenticateUser(email, password);
    if (user) {
      console.log('Usuário autenticado com sucesso:', user);
    } else {
      console.log('Falha na autenticação. Verifique suas credenciais.');
    }
  } catch (error) {
    console.error('Erro ao autenticar:', error.message);
  }
}

testLogin();
