// src/app.js
// Configuração do Express (middlewares globais e rotas)
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import clientsRoutes from './routes/clients.routes.js';

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Healthcheck
app.get('/', (req, res) => {
  res.json({ ok: true, name: 'TecSolutions API', version: '1.0.0' });
});

// Prefixo da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientsRoutes);

export default app;
