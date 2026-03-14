import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

export const getDeliveries = async (req: Request, res: Response) => {
  try {
    const deliveries = await prisma.delivery.findMany({
      include: { 
        sourceLocation: { include: { warehouse: true } }, 
        items: { include: { product: true } } 
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(deliveries);
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
};

export const createDelivery = async (req: Request, res: Response) => {
  const { customer, contact, scheduledDate, sourceLocationId, items } = req.body;
  try {
    const count = await prisma.delivery.count();
    const reference = `DEL-${(count + 1).toString().padStart(4, '0')}`;

    // Check availability
    let allAvailable = true;
    for (const item of items) {
      const stock = await prisma.stock.findUnique({
        where: { productId_locationId: { productId: item.productId, locationId: sourceLocationId } }
      });
      if (!stock || stock.onHand < parseInt(item.quantity)) {
        allAvailable = false;
        break;
      }
    }

    const delivery = await prisma.delivery.create({
      data: {
        reference,
        customer,
        contact,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        sourceLocationId,
        status: allAvailable ? 'Ready' : 'Waiting',
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: parseInt(item.quantity),
          })),
        },
      },
      include: { items: true },
    });
    res.status(201).json(delivery);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create delivery' });
  }
};

export const validateDelivery = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const delivery = await prisma.delivery.findUnique({
      where: { id },
      include: { 
        items: { include: { product: true } }, 
        sourceLocation: { include: { warehouse: true } } 
      },
    });

    if (!delivery || delivery.status === 'Done') {
      return res.status(400).json({ error: 'Invalid delivery or already validated' });
    }

    // Double check availability
    for (const item of delivery.items) {
      const stock = await prisma.stock.findUnique({
        where: { productId_locationId: { productId: item.productId, locationId: delivery.sourceLocationId } }
      });
      if (!stock || stock.onHand < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${item.product.name}` });
      }
    }

    await prisma.$transaction(async (tx) => {
      for (const item of delivery.items) {
        // Decrease stock
        await tx.stock.update({
          where: { productId_locationId: { productId: item.productId, locationId: delivery.sourceLocationId } },
          data: { onHand: { decrement: item.quantity } },
        });

        // Create move history
        await tx.inventoryMove.create({
          data: {
            reference: delivery.reference,
            productId: item.productId,
            sourceLocation: delivery.sourceLocation.name,
            destinationLocation: 'Customer',
            quantity: item.quantity,
            status: 'Done',
          },
        });
      }

      await tx.delivery.update({
        where: { id },
        data: { status: 'Done' },
      });
    });

    res.json({ message: 'Delivery validated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Validation failed' });
  }
};

export const cancelDelivery = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.delivery.update({
      where: { id },
      data: { status: 'Cancelled' },
    });
    res.json({ message: 'Delivery cancelled' });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
};
