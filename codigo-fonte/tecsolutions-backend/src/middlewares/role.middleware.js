// Middleware para checar se o usuário é admin
export const isAdmin = (req, res, next) => {
  if (req.user?.role !== "ADMIN") {
    return res
      .status(403)
      .json({
        error:
          "Acesso negado: apenas administradores podem realizar essa ação.",
      });
  }
  next();
};
