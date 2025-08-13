// src/controllers/products.controller.js
import prisma from '../config/db.js';

// Listar produtos
export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
};

// Criar produto
export const createProduct = async (req, res) => {
  const {
    name, description, price, category, unit,
    brand, model, stock
  } = req.body;

  try {
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        category,
        unit,
        brand,
        model,
        stock: stock || 0
      }
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar produto' });
  }
};

// Atualizar produto
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const {
    name, description, price, category, unit,
    brand, model, stock
  } = req.body;

  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        category,
        unit,
        brand,
        model,
        stock
      }
    });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
};

// Deletar produto
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Produto removido com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar produto' });
  }
};
