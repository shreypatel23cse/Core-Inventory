import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

export const getSettings = async (req: Request, res: Response) => {
  try {
    let settings = await prisma.settings.findUnique({ where: { id: 'default' } });
    if (!settings) {
      settings = await prisma.settings.create({ data: { id: 'default' } });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  const { autoSku, lowStockAlerts } = req.body;
  try {
    const settings = await prisma.settings.upsert({
      where: { id: 'default' },
      update: { autoSku, lowStockAlerts },
      create: { id: 'default', autoSku, lowStockAlerts },
    });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
};
