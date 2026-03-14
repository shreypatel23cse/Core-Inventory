import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

export const getReceipts = async (req: Request, res: Response) => {
  try {
    const receipts = await prisma.receipt.findMany({
      include: { 
        destinationLocation: { include: { warehouse: true } }, 
        items: { include: { product: true } } 
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(receipts);
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
};

export const createReceipt = async (req: Request, res: Response) => {
  const { vendor, scheduledDate, destinationLocationId, items } = req.body;
  try {
    const count = await prisma.receipt.count();
    const reference = `WH/IN/${(count + 1).toString().padStart(4, '0')}`;

    const receipt = await prisma.receipt.create({
      data: {
        reference,
        vendor,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        destinationLocationId,
        status: 'Draft',
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: parseInt(item.quantity),
          })),
        },
      },
      include: { items: true },
    });
    res.status(201).json(receipt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create receipt' });
  }
};

export const markReadyReceipt = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const receipt = await prisma.receipt.update({
      where: { id },
      data: { status: 'Ready' },
    });
    res.json(receipt);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
};

export const validateReceipt = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: { 
        items: { include: { product: true } }, 
        destinationLocation: { include: { warehouse: true } } 
      },
    });

    if (!receipt || receipt.status === 'Done') {
      return res.status(400).json({ error: 'Invalid receipt or already validated' });
    }

    // Update stocks and move history in a transaction
    await prisma.$transaction(async (tx) => {
      for (const item of receipt.items) {
        // Increase stock
        await tx.stock.upsert({
          where: { productId_locationId: { productId: item.productId, locationId: receipt.destinationLocationId } },
          update: { onHand: { increment: item.quantity } },
          create: { productId: item.productId, locationId: receipt.destinationLocationId, onHand: item.quantity },
        });

        // Create move history
        await tx.inventoryMove.create({
          data: {
            reference: receipt.reference,
            productId: item.productId,
            sourceLocation: 'Vendor',
            destinationLocation: receipt.destinationLocation.name,
            quantity: item.quantity,
            status: 'Done',
          },
        });
      }

      // Update receipt status
      await tx.receipt.update({
        where: { id },
        data: { status: 'Done' },
      });
    });

    res.json({ message: 'Receipt validated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Validation failed' });
  }
};

export const cancelReceipt = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.receipt.update({
      where: { id },
      data: { status: 'Cancelled' },
    });
    res.json({ message: 'Receipt cancelled' });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
};
