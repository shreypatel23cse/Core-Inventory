import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  const { name, sku, unit, description, minStockLevel } = req.body;
  try {
    const product = await prisma.product.create({
      data: {
        name,
        sku,
        unit,
        description,
        minStockLevel: parseInt(minStockLevel) || 10,
      },
    });
    res.status(201).json(product);
  } catch (err: any) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'SKU must be unique' });
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, sku, unit, description, minStockLevel } = req.body;
  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        sku,
        unit,
        description,
        minStockLevel: parseInt(minStockLevel),
      },
    });
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Product deleted' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
};
