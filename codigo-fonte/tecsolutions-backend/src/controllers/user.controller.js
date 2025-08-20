import prisma from "../config/db.js";
import bcrypt from "bcryptjs";

// Criar usuário
export const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "USER", // default USER
      },
    });

    res.status(201).json({ message: "Usuário criado com sucesso", user });
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
};

// Listar todos usuários
export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
};
