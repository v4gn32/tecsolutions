// src/app.js
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import serviceRoutes from "./routes/services.routes.js";
import clientRoutes from "./routes/clients.routes.js";
import productsRoutes from "./routes/products.routes.js";

const app = express();
app.use(cors({ origin: ["http://localhost:5173"], credentials: true })); // 🔓 CORS
app.use(express.json()); // 🧰 parser JSON

// monta rotas com prefixo /api
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/products", productsRoutes);

// opcional: rota de saúde
app.get("/api/auth/health", (req, res) => res.json({ ok: true })); // teste rápido

// Handler de erro (opcional)
app.use((err, req, res, next) => {
  console.error(err); // 🧯 log
  res.status(500).json({ error: "Erro interno" });
});

export default app;
