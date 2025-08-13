// src/controllers/proposals.controller.js
import prisma from '../config/db.js';

// Listar todas as propostas
export const getProposals = async (req, res) => {
  try {
    const proposals = await prisma.proposal.findMany({
      include: {
        client: true,
        items: true,
        productItems: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(proposals);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar propostas' });
  }
};

// Criar nova proposta
export const createProposal = async (req, res) => {
  const {
    clientId,
    number,
    title,
    description,
    discount,
    total,
    subtotal,
    status,
    validUntil,
    notes,
    items,
    productItems
  } = req.body;

  try {
    const proposal = await prisma.proposal.create({
      data: {
        clientId,
        number,
        title,
        description,
        discount,
        total,
        subtotal,
        status,
        validUntil: new Date(validUntil),
        notes,
        userId: req.user.id,
        items: {
          create: items.map((item) => ({
            serviceId: item.serviceId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total
          }))
        },
        productItems: {
          create: productItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total
          }))
        }
      },
      include: {
        client: true,
        items: true,
        productItems: true
      }
    });

    res.status(201).json(proposal);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar proposta', details: err.message });
  }
};

// Deletar proposta
export const deleteProposal = async (req, res) => {
  const { id } = req.params;

  try {
    // Excluir itens antes
    await prisma.proposalItem.deleteMany({ where: { proposalId: id } });
    await prisma.proposalProductItem.deleteMany({ where: { proposalId: id } });

    await prisma.proposal.delete({ where: { id } });
    res.json({ message: 'Proposta excluída com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar proposta' });
  }
};
