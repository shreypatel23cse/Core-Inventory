import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalProducts = await prisma.product.count();
    const pendingReceipts = await prisma.receipt.count({ where: { status: { not: 'Done' } } });
    const pendingDeliveries = await prisma.delivery.count({ where: { status: { not: 'Done' } } });
    const recentMoves = await prisma.inventoryMove.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: { product: true }
    });

    // Manually fetch low stock items correctly
    const allStockItems = await prisma.stock.findMany({
      include: { product: true },
      where: { onHand: { gte: 0 } }
    });

    const lowStockItems = Array.from(new Set(
      allStockItems
        .filter(s => s.onHand < s.product.minStockLevel)
        .map(s => s.productId)
    )).length;

    res.json({
      totalProducts,
      lowStockItems, // This logic is simplified
      pendingReceipts,
      pendingDeliveries,
      recentMoves
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};
