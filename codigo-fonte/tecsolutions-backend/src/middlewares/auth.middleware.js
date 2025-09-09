// src/middlewares/auth.middleware.js
import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
  const header = req.headers.authorization || "";
  let token = "";

  if (header.startsWith("Bearer ")) {
    token = header.split(" ")[1];
  }
  if (!token && req.query?.token) {
    token = String(req.query.token);
  }
  if (!token) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.user = decoded; // { id, name, email, role }
    return next();
  } catch {
    return res.status(401).json({ message: "Token inválido" });
  }
}
