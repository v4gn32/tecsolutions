// server.js
// => Ponto de entrada. Carrega env e sobe servidor na porta 3000
import 'dotenv/config';
import app from './src/app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} 🚀`);
});
