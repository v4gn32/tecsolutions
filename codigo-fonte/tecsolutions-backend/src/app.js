import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import clientRoutes from './routes/clients.js';
import serviceRoutes from './routes/services.js';
import productRoutes from './routes/products.js';
import proposalRoutes from './routes/proposals.js';
import inventoryRoutes from './routes/inventory.js';
import serviceRecordRoutes from './routes/serviceRecords.js';
import userRoutes from './routes/users.js';
import reportRoutes from './routes/reports.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP por janela de tempo
  message: {
    error: 'Muitas tentativas. Tente novamente em 15 minutos.'
  }
});

// Middlewares globais
app.use(helmet()); // Segurança
app.use(compression()); // Compressão
app.use(limiter); // Rate limiting
app.use(morgan('combined')); // Logs
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/products', productRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/service-records', serviceRecordRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl
  });
});

// Middleware de tratamento de erros
app.use(errorHandler);

export default app;
