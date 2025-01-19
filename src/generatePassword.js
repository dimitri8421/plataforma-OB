const bcrypt = require('bcryptjs');

const newPassword = 'novaSenha123';  // Nova senha

bcrypt.hash(newPassword, 12, (err, hashedPassword) => {
  if (err) {
    console.error('Erro ao criptografar a senha:', err);
  } else {
    console.log('Nova senha criptografada:', hashedPassword);
  }
});
