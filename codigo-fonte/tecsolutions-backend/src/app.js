// src/app.js
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import clientRoutes from "./routes/clients.routes.js";
import serviceRoutes from "./routes/services.routes.js";
import productRoutes from "./routes/products.routes.js";
import proposalRoutes from "./routes/proposals.routes.js";
import reportRoutes from "./routes/reports.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Rotas
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/products", productRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/reports", reportRoutes);

export default app;
