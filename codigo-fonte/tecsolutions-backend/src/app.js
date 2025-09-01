// src/app.js
// => Configura Express, middlewares globais e rotas /api/*
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Rotas
import authRoutes from '../src/routes/auth.routes.js';
import userRoutes from '../src/routes/user.routes.js';
import clientsRoutes from '../src/routes/clients.routes.js';
import productsRoutes from '../src/routes/products.routes.js';
import servicesRoutes from '../src/routes/services.routes.js';
import proposalsRoutes from '../src/routes/proposals.routes.js';
import reportsRoutes from '../src/routes/reports.routes.js';

const app = express();

// Middlewares globais
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Healthcheck
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/proposals', proposalsRoutes);
app.use('/api/reports', reportsRoutes);

export default app;
