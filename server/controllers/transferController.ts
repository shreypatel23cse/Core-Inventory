import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

export const createTransfer = async (req: Request, res: Response) => {
  const { productId, sourceLocationId, destinationLocationId, quantity } = req.body;
  const qty = parseInt(quantity);

  if (sourceLocationId === destinationLocationId) {
    return res.status(400).json({ error: 'Source and destination locations must be different' });
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Check source stock
      const sourceStock = await tx.stock.findUnique({
        where: { productId_locationId: { productId, locationId: sourceLocationId } }
      });

      if (!sourceStock || sourceStock.onHand < qty) {
        throw new Error('Insufficient stock at source location');
      }

      // 2. Decrease source stock
      await tx.stock.update({
        where: { productId_locationId: { productId, locationId: sourceLocationId } },
        data: { onHand: { decrement: qty } }
      });

      // 3. Increase destination stock
      await tx.stock.upsert({
        where: { productId_locationId: { productId, locationId: destinationLocationId } },
        update: { onHand: { increment: qty } },
        create: { productId, locationId: destinationLocationId, onHand: qty }
      });

      // 4. Record move
      const sourceLoc = await tx.location.findUnique({ where: { id: sourceLocationId } });
      const destLoc = await tx.location.findUnique({ where: { id: destinationLocationId } });

      await tx.inventoryMove.create({
        data: {
          reference: `TRF-${Date.now().toString().slice(-4)}`,
          productId,
          sourceLocation: sourceLoc?.name || 'Unknown',
          destinationLocation: destLoc?.name || 'Unknown',
          quantity: qty,
          status: 'Done',
          date: new Date(),
        }
      });
    });

    res.json({ message: 'Internal transfer completed successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Transfer failed' });
  }
};
