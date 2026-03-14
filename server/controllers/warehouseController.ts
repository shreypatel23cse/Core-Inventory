import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

export const getWarehouses = async (req: Request, res: Response) => {
  try {
    const warehouses = await prisma.warehouse.findMany({ include: { locations: true } });
    res.json(warehouses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch warehouses' });
  }
};

export const createWarehouse = async (req: Request, res: Response) => {
  const { name, shortCode, address } = req.body;
  try {
    const warehouse = await prisma.warehouse.create({ data: { name, shortCode, address } });
    res.status(201).json(warehouse);
  } catch (err: any) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'Short code must be unique' });
    res.status(500).json({ error: 'Failed to create warehouse' });
  }
};

export const updateWarehouse = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, shortCode, address } = req.body;
  try {
    const warehouse = await prisma.warehouse.update({ where: { id }, data: { name, shortCode, address } });
    res.json(warehouse);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
};

export const deleteWarehouse = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.warehouse.delete({ where: { id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
};

// Locations
export const getLocations = async (req: Request, res: Response) => {
  try {
    const locations = await prisma.location.findMany({ include: { warehouse: true } });
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
};

export const createLocation = async (req: Request, res: Response) => {
  const { name, shortCode, warehouseId } = req.body;
  try {
    const location = await prisma.location.create({ data: { name, shortCode, warehouseId } });
    res.status(201).json(location);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed' });
  }
};

export const deleteLocation = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.location.delete({ where: { id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
};
