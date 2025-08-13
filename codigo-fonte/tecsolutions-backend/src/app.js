// src/app.js
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
// ...demais imports

const app = express();
app.use(cors());            // habilita CORS
app.use(express.json());    // aceita JSON

// monta rotas com prefixo /api
app.use("/api/auth", authRoutes);
// app.use("/api/clients", clientRoutes);
// ...

// opcional: rota de saúde
app.get("/api/auth/health", (req, res) => res.json({ ok: true })); // teste rápido

export default app;
