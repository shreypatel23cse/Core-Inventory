import { Router, Response } from 'express';
import pool from '../db/pool';
import { authMiddleware, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// ============================================
// PRODUCTS
// ============================================

// GET /api/products
router.get('/products', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    return res.json(result.rows.map(row => ({
      id: row.id,
      name: row.name,
      sku: row.sku,
      category: row.category,
      uom: row.uom,
      description: row.description,
      active: row.active,
    })));
  } catch (err) {
    console.error('List products error:', err);
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST /api/products
router.post('/products', requireRole('admin', 'manager'), async (req: AuthRequest, res: Response) => {
  const { name, sku, category, uom, description, active } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO products (name, sku, category, uom, description, active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, sku, category || 'General', uom || 'Units', description || '', active !== false]
    );
    const row = result.rows[0];
    return res.status(201).json({
      id: row.id,
      name: row.name,
      sku: row.sku,
      category: row.category,
      uom: row.uom,
      description: row.description,
      active: row.active,
    });
  } catch (err: any) {
    console.error('Create product error:', err);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Product with this SKU already exists.' });
    }
    return res.status(500).json({ error: 'Failed to create product' });
  }
});

// ============================================
// OPERATIONS
// ============================================

// GET /api/operations?type=receipt
router.get('/operations', async (req: AuthRequest, res: Response) => {
  try {
    const { type } = req.query;
    let queryText = 'SELECT * FROM operations';
    const params: any[] = [];

    if (type) {
      queryText += ' WHERE type = $1';
      params.push(type);
    }

    queryText += ' ORDER BY created_at DESC';

    const result = await pool.query(queryText, params);
    return res.json(result.rows.map(row => ({
      id: row.id,
      reference: row.reference,
      type: row.type,
      status: row.status,
      sourceLocationId: row.source_location_id,
      destLocationId: row.dest_location_id,
      contact: row.contact,
      scheduledDate: row.scheduled_date,
      responsibleUid: row.responsible_uid,
      createdAt: row.created_at,
    })));
  } catch (err) {
    console.error('List operations error:', err);
    return res.status(500).json({ error: 'Failed to fetch operations' });
  }
});

// POST /api/operations
router.post('/operations', requireRole('admin', 'manager'), async (req: AuthRequest, res: Response) => {
  const { reference, type, contact, scheduledDate, sourceLocationId, destLocationId, items } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create operation
    const opResult = await client.query(
      `INSERT INTO operations (reference, type, status, source_location_id, dest_location_id, contact, scheduled_date, responsible_uid)
       VALUES ($1, $2, 'draft', $3, $4, $5, $6, $7)
       RETURNING *`,
      [reference, type, sourceLocationId || null, destLocationId || null, contact || null, scheduledDate || null, req.user!.id]
    );

    const operation = opResult.rows[0];

    // Create operation items
    if (items && items.length > 0) {
      for (const item of items) {
        await client.query(
          `INSERT INTO operation_items (operation_id, product_id, quantity)
           VALUES ($1, $2, $3)`,
          [operation.id, item.productId, item.quantity]
        );
      }
    }

    await client.query('COMMIT');

    return res.status(201).json({
      id: operation.id,
      reference: operation.reference,
      type: operation.type,
      status: operation.status,
      sourceLocationId: operation.source_location_id,
      destLocationId: operation.dest_location_id,
      contact: operation.contact,
      scheduledDate: operation.scheduled_date,
      responsibleUid: operation.responsible_uid,
      createdAt: operation.created_at,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create operation error:', err);
    return res.status(500).json({ error: 'Failed to create operation' });
  } finally {
    client.release();
  }
});

// POST /api/operations/:id/validate
router.post('/operations/:id/validate', requireRole('admin', 'manager', 'staff'), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get operation
    const opResult = await client.query('SELECT * FROM operations WHERE id = $1', [id]);
    if (opResult.rows.length === 0) {
      return res.status(404).json({ error: 'Operation not found' });
    }
    const op = opResult.rows[0];

    if (op.status === 'done') {
      return res.status(400).json({ error: 'Operation already validated' });
    }

    // Get items
    const itemsResult = await client.query('SELECT * FROM operation_items WHERE operation_id = $1', [id]);
    const items = itemsResult.rows;

    for (const item of items) {
      // Decrease source stock
      if (op.source_location_id) {
        await client.query(
          `INSERT INTO stock (product_id, location_id, quantity)
           VALUES ($1, $2, -$3)
           ON CONFLICT (product_id, location_id) 
           DO UPDATE SET quantity = stock.quantity - $3`,
          [item.product_id, op.source_location_id, item.quantity]
        );
      }

      // Increase dest stock
      if (op.dest_location_id) {
        await client.query(
          `INSERT INTO stock (product_id, location_id, quantity)
           VALUES ($1, $2, $3)
           ON CONFLICT (product_id, location_id) 
           DO UPDATE SET quantity = stock.quantity + $3`,
          [item.product_id, op.dest_location_id, item.quantity]
        );
      }

      // Move history
      await client.query(
        `INSERT INTO move_history (operation_id, product_id, from_location_id, to_location_id, quantity)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, item.product_id, op.source_location_id || null, op.dest_location_id || null, item.quantity]
      );
    }

    // Update status
    await client.query('UPDATE operations SET status = $1 WHERE id = $2', ['done', id]);

    await client.query('COMMIT');
    return res.json({ message: 'Operation validated successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Validate operation error:', err);
    return res.status(500).json({ error: 'Failed to validate operation' });
  } finally {
    client.release();
  }
});

// ============================================
// STOCK
// ============================================

// GET /api/stock
router.get('/stock', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM stock');
    return res.json(result.rows.map(row => ({
      id: row.id,
      productId: row.product_id,
      locationId: row.location_id,
      quantity: row.quantity,
    })));
  } catch (err) {
    console.error('List stock error:', err);
    return res.status(500).json({ error: 'Failed to fetch stock' });
  }
});

// ============================================
// MOVE HISTORY
// ============================================

// GET /api/move-history
router.get('/move-history', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM move_history ORDER BY timestamp DESC');
    return res.json(result.rows.map(row => ({
      id: row.id,
      operationId: row.operation_id,
      productId: row.product_id,
      fromLocationId: row.from_location_id,
      toLocationId: row.to_location_id,
      quantity: row.quantity,
      timestamp: row.timestamp,
    })));
  } catch (err) {
    console.error('List move history error:', err);
    return res.status(500).json({ error: 'Failed to fetch move history' });
  }
});

// ============================================
// WAREHOUSES
// ============================================

// GET /api/warehouses
router.get('/warehouses', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM warehouses ORDER BY name');
    return res.json(result.rows.map(row => ({
      id: row.id,
      name: row.name,
      code: row.code,
      address: row.address,
    })));
  } catch (err) {
    console.error('List warehouses error:', err);
    return res.status(500).json({ error: 'Failed to fetch warehouses' });
  }
});

// ============================================
// LOCATIONS
// ============================================

// GET /api/locations
router.get('/locations', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM locations ORDER BY name');
    return res.json(result.rows.map(row => ({
      id: row.id,
      name: row.name,
      code: row.code,
      warehouseId: row.warehouse_id,
      type: row.type,
    })));
  } catch (err) {
    console.error('List locations error:', err);
    return res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// ============================================
// SEED DEMO DATA
// ============================================

// POST /api/seed
router.post('/seed', requireRole('admin'), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Add Warehouses
    const wh1 = await client.query(
      `INSERT INTO warehouses (name, code, address) VALUES ($1, $2, $3) RETURNING id`,
      ['Main Warehouse', 'WH-MAIN', '123 Industrial Way']
    );
    const wh2 = await client.query(
      `INSERT INTO warehouses (name, code, address) VALUES ($1, $2, $3) RETURNING id`,
      ['Secondary Hub', 'WH-HUB', '456 Logistics Blvd']
    );

    // Add Locations
    await client.query(
      `INSERT INTO locations (name, code, warehouse_id, type) VALUES ($1, $2, $3, $4)`,
      ['Shelf A1', 'A1', wh1.rows[0].id, 'internal']
    );
    await client.query(
      `INSERT INTO locations (name, code, warehouse_id, type) VALUES ($1, $2, $3, $4)`,
      ['Shelf B2', 'B2', wh1.rows[0].id, 'internal']
    );

    // Add Products
    await client.query(
      `INSERT INTO products (name, sku, category, uom, description, active) VALUES ($1, $2, $3, $4, $5, $6)`,
      ['Steel Rods', 'SR-001', 'Raw Material', 'kg', 'High grade steel rods', true]
    );
    await client.query(
      `INSERT INTO products (name, sku, category, uom, description, active) VALUES ($1, $2, $3, $4, $5, $6)`,
      ['Aluminum Sheets', 'AS-005', 'Raw Material', 'm2', '2mm aluminum sheets', true]
    );

    await client.query('COMMIT');
    return res.json({ message: 'Demo data seeded successfully' });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('Seed error:', err);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Demo data already exists. Duplicate entries found.' });
    }
    return res.status(500).json({ error: 'Failed to seed demo data' });
  } finally {
    client.release();
  }
});

export default router;
