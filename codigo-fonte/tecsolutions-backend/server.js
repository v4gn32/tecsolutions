// server.js (raiz) - sobe o servidor
import "dotenv/config"; // carrega .env
import app from "./src/app.js"; // app Express já configurado

const PORT = process.env.PORT || 5000; // porta
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT} 🚀`));
