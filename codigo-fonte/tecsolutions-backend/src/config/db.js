// src/config/db.js
// => Exporta instância única do Prisma Client
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;
