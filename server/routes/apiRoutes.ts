import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse, getLocations, createLocation, deleteLocation } from '../controllers/warehouseController.js';
import { getStock, adjustStock, getMoves } from '../controllers/stockController.js';
import { getReceipts, createReceipt, markReadyReceipt, validateReceipt, cancelReceipt } from '../controllers/receiptController.js';
import { getDeliveries, createDelivery, validateDelivery, cancelDelivery } from '../controllers/deliveryController.js';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { createTransfer } from '../controllers/transferController.js';
import { getSettings, updateSettings } from '../controllers/settingsController.js';

const router = Router();

// Dashboard
router.get('/dashboard/stats', authMiddleware, getDashboardStats);

// Products
router.get('/products', authMiddleware, getProducts);
router.post('/products', authMiddleware, createProduct);
router.put('/products/:id', authMiddleware, updateProduct);
router.delete('/products/:id', authMiddleware, requireRole(['Admin']), deleteProduct);

// Warehouses
router.get('/warehouses', authMiddleware, getWarehouses);
router.post('/warehouses', authMiddleware, createWarehouse);
router.put('/warehouses/:id', authMiddleware, updateWarehouse);
router.delete('/warehouses/:id', authMiddleware, requireRole(['Admin']), deleteWarehouse);

// Locations
router.get('/locations', authMiddleware, getLocations);
router.post('/locations', authMiddleware, createLocation);
router.delete('/locations/:id', authMiddleware, requireRole(['Admin']), deleteLocation);

// Stock
router.get('/stock', authMiddleware, getStock);
router.post('/stock/adjust', authMiddleware, adjustStock);

// Receipts
router.get('/receipts', authMiddleware, getReceipts);
router.post('/receipts', authMiddleware, createReceipt);
router.post('/receipts/:id/mark-ready', authMiddleware, markReadyReceipt);
router.post('/receipts/:id/validate', authMiddleware, validateReceipt);
router.post('/receipts/:id/cancel', authMiddleware, cancelReceipt);

// Deliveries
router.get('/deliveries', authMiddleware, getDeliveries);
router.post('/deliveries', authMiddleware, createDelivery);
router.post('/deliveries/:id/validate', authMiddleware, validateDelivery);
router.post('/deliveries/:id/cancel', authMiddleware, cancelDelivery);

// Transfers
router.post('/transfers', authMiddleware, createTransfer);

// Moves
router.get('/moves', authMiddleware, getMoves);

// Settings
router.get('/settings', authMiddleware, requireRole(['Admin']), getSettings);
router.post('/settings', authMiddleware, requireRole(['Admin']), updateSettings);

export default router;
