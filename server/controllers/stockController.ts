import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

export const getStock = async (req: Request, res: Response) => {
  try {
    const stock = await prisma.stock.findMany({
      include: { product: true, location: { include: { warehouse: true } } },
    });
    res.json(stock);
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
};

export const adjustStock = async (req: Request, res: Response) => {
  const { productId, locationId, quantity, type, reason } = req.body;
  // type: 'add' or 'subtract'
  try {
    const qty = parseInt(quantity);
    const multiplier = type === 'subtract' ? -1 : 1;

    await prisma.$transaction(async (tx) => {
      const stock = await tx.stock.upsert({
        where: { productId_locationId: { productId, locationId } },
        update: { onHand: { increment: qty * multiplier } },
        create: { productId, locationId, onHand: multiplier > 0 ? qty : 0 },
      });

      const location = await tx.location.findUnique({ where: { id: locationId } });

      await tx.inventoryMove.create({
        data: {
          reference: `ADJ-${Date.now().toString().slice(-4)}`,
          productId,
          sourceLocation: multiplier < 0 ? location?.name : 'Adjustment',
          destinationLocation: multiplier > 0 ? location?.name : 'Adjustment',
          quantity: qty,
          status: 'Done',
          date: new Date(),
        },
      });
    });

    res.json({ message: 'Stock adjusted' });
  } catch (err) {
    res.status(500).json({ error: 'Adjustment failed' });
  }
};

export const getMoves = async (req: Request, res: Response) => {
  try {
    const moves = await prisma.inventoryMove.findMany({
      include: { product: true },
      orderBy: { date: 'desc' },
    });
    res.json(moves);
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
};
