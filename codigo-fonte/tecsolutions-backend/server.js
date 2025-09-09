// server.js
// Ponto de entrada da aplicação - carrega variáveis e inicia o servidor
import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`TecSolutions API rodando em http://localhost:${PORT}`);
});
