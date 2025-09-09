// src/config/db.js
// Conexão Prisma (singleton)
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;
