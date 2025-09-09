// src/middlewares/role.middleware.js
// Middlewares de autorização por papel (role)
// Funções nomeadas: isAdmin, allowRoles

/**
 * Garante que o usuário foi autenticado (auth middleware deve rodar antes)
 * e checa se a role é 'admin'.
 */
export function isAdmin(req, res, next) {
  // Se o auth middleware não populou req.user, bloqueia
  if (!req.user) {
    return res.status(401).json({ message: 'Não autenticado' });
  }

  const role = String(req.user.role || '').toLowerCase();

  if (role !== 'admin') {
    return res.status(403).json({ message: 'Acesso restrito a administradores' });
  }

  return next();
}

/**
 * Permite declarar múltiplas roles aceitas.
 * Ex.: router.use(auth, allowRoles('admin', 'user'));
 */
export function allowRoles(...roles) {
  const accepted = roles.map(r => String(r).toLowerCase());

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autenticado' });
    }

    const role = String(req.user.role || '').toLowerCase();
    if (!accepted.includes(role)) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    return next();
  };
}
