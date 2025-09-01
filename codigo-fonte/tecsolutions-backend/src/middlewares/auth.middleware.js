// src/middlewares/auth.middleware.js
// => Valida JWT e injeta req.user
import jwt from 'jsonwebtoken';

export function authenticate(req, res, next) {
  try {
    // Token pode vir no header Authorization: Bearer <token>
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) return res.status(401).json({ message: 'Token ausente' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, role: payload.role, name: payload.name, email: payload.email };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}
