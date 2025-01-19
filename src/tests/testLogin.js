

async function testLogin() {
  const email = 'lucas.camacho@gmail.com';
  const password = '1234';

  if (!email || !password) {
    console.error('Erro: Email e senha são obrigatórios!');
    return;
  }

  const response = await fetch('http://localhost:5000/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  })
  

  const data = await response.json();

  console.log(data);

 
}

testLogin();
