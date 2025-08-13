// src/middlewares/auth.middleware.js
import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // salva info do usuário autenticado
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Acesso negado: apenas administradores' });
  }
  next();
};
