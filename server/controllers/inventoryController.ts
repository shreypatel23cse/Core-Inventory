import { Response, Request } from 'express';
import pool from '../config/db.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

// ============================================
// GET /api/inventory
// ============================================
export async function getInventory(req: AuthRequest, res: Response) {
  try {
    const result = await pool.query(`
      SELECT s.id, s.quantity,
             p.id as product_id, p.name as product_name, p.sku, p.category, p.uom,
             l.id as location_id, l.name as location_name, l.code as location_code
      FROM stock s
      JOIN products p ON s.product_id = p.id
      JOIN locations l ON s.location_id = l.id
      WHERE s.quantity != 0
      ORDER BY p.name
    `);

    return res.json({
      count: result.rows.length,
      inventory: result.rows.map(row => ({
        id: row.id,
        quantity: row.quantity,
        product: { id: row.product_id, name: row.product_name, sku: row.sku, category: row.category, uom: row.uom },
        location: { id: row.location_id, name: row.location_name, code: row.location_code },
      })),
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch inventory' });
  }
}

// ============================================
// DASHBOARD STATS
// ============================================
export async function getDashboardStats(req: AuthRequest, res: Response) {
  try {
    const totalProducts = await pool.query('SELECT COUNT(*) FROM products');
    const lowStock = await pool.query('SELECT COUNT(DISTINCT product_id) FROM stock WHERE quantity < 10');
    const pendingReceipts = await pool.query("SELECT COUNT(*) FROM operations WHERE type='receipt' AND status!='done'");
    const pendingDeliveries = await pool.query("SELECT COUNT(*) FROM operations WHERE type='delivery' AND status!='done'");

    return res.json({
      totalProducts: parseInt(totalProducts.rows[0].count),
      lowStock: parseInt(lowStock.rows[0].count),
      pendingReceipts: parseInt(pendingReceipts.rows[0].count),
      pendingDeliveries: parseInt(pendingDeliveries.rows[0].count),
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
}

// ============================================
// PRODUCT CRUD
// ============================================
export async function getProducts(req: AuthRequest, res: Response) {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    return res.json(result.rows);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
}

export async function getProduct(req: AuthRequest, res: Response) {
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Database error' });
  }
}

export async function createProduct(req: AuthRequest, res: Response) {
  const { name, sku, category, uom, description, reorderLevel } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO products (name, sku, category, uom, description, reorder_level)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, sku, category || 'General', uom || 'Units', description || '', reorderLevel || 10]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err: any) {
    return res.status(400).json({ error: err.code === '23505' ? 'SKU already exists' : 'Failed to create product' });
  }
}

export async function updateProduct(req: AuthRequest, res: Response) {
  const { name, category, uom, description, reorderLevel, active } = req.body;
  try {
    const result = await pool.query(
      `UPDATE products SET name=$1, category=$2, uom=$3, description=$4, reorder_level=$5, active=$6
       WHERE id=$7 RETURNING *`,
      [name, category, uom, description, reorderLevel, active, req.params.id]
    );
    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Update failed' });
  }
}

// ============================================
// OPERATIONS
// ============================================
export async function getOperations(req: AuthRequest, res: Response) {
  try {
    const { type } = req.query;
    let query = 'SELECT * FROM operations';
    const params = [];
    if (type) {
      query += ' WHERE type = $1';
      params.push(type);
    }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch operations' });
  }
}

export async function createOperation(req: AuthRequest, res: Response) {
  const { reference, type, contact, scheduledDate, sourceLocationId, destLocationId, items } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const opRes = await client.query(
      `INSERT INTO operations (reference, type, status, source_location_id, dest_location_id, contact, scheduled_date, responsible_uid)
       VALUES ($1, $2, 'draft', $3, $4, $5, $6, $7) RETURNING *`,
      [reference || `${type.toUpperCase()}-${Date.now()}`, type, sourceLocationId, destLocationId, contact, scheduledDate, req.user!.id]
    );
    const op = opRes.rows[0];
    for (const item of items) {
      await client.query('INSERT INTO operation_items (operation_id, product_id, quantity) VALUES ($1, $2, $3)', [op.id, item.productId, item.quantity]);
    }
    await client.query('COMMIT');
    return res.status(201).json(op);
  } catch (err) {
    await client.query('ROLLBACK');
    return res.status(500).json({ error: 'Failed to create operation' });
  } finally {
    client.release();
  }
}

export async function validateOperation(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const opRes = await client.query('SELECT * FROM operations WHERE id = $1', [id]);
    if (opRes.rows.length === 0) throw new Error('Operation not found');
    const op = opRes.rows[0];
    if (op.status === 'done') throw new Error('Operation already finalized');

    const items = await client.query('SELECT * FROM operation_items WHERE operation_id = $1', [id]);

    for (const item of items.rows) {
      // 1. Check stock availability for outputs (Delivery/Transfer)
      if (op.source_location_id) {
        const stockRes = await client.query('SELECT quantity FROM stock WHERE product_id=$1 AND location_id=$2', [item.product_id, op.source_location_id]);
        const currentQty = stockRes.rows[0]?.quantity || 0;
        if (currentQty < item.quantity) {
          throw new Error(`Insufficient stock for product ${item.product_id}. Available: ${currentQty}, Needed: ${item.quantity}`);
        }
        await client.query('UPDATE stock SET quantity = quantity - $1 WHERE product_id=$2 AND location_id=$3', [item.quantity, item.product_id, op.source_location_id]);
      }

      // 2. Add stock for inputs (Receipt/Transfer/Adjustment)
      if (op.dest_location_id) {
        await client.query(
          `INSERT INTO stock (product_id, location_id, quantity) VALUES ($1, $2, $3)
           ON CONFLICT (product_id, location_id) DO UPDATE SET quantity = stock.quantity + $3`,
          [item.product_id, op.dest_location_id, item.quantity]
        );
      }

      // 3. Ledger entry
      await client.query(
        `INSERT INTO move_history (operation_id, product_id, from_location_id, to_location_id, quantity)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, item.product_id, op.source_location_id, op.dest_location_id, item.quantity]
      );
    }

    await client.query('UPDATE operations SET status = $1 WHERE id = $2', ['done', id]);
    await client.query('COMMIT');
    return res.json({ message: 'Success' });
  } catch (err: any) {
    await client.query('ROLLBACK');
    return res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
}

// ============================================
// STOCK ADJUSTMENT
// ============================================
export async function createAdjustment(req: AuthRequest, res: Response) {
  const { productId, locationId, countedQuantity, reason } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Get current stock
    const stockRes = await client.query(
      'SELECT quantity FROM stock WHERE product_id = $1 AND location_id = $2',
      [productId, locationId]
    );
    const currentQty = stockRes.rows[0]?.quantity || 0;
    const diff = countedQuantity - currentQty;

    if (diff === 0) {
      return res.json({ message: 'No adjustment needed. Count matches system.' });
    }

    // 2. Create adjustment operation
    const opRes = await client.query(
      `INSERT INTO operations (reference, type, status, source_location_id, dest_location_id, contact, responsible_uid)
       VALUES ($1, $2, 'draft', $3, $4, $5, $6) RETURNING *`,
      [
        `ADJ-${Date.now().toString().slice(-4)}`,
        'adjustment',
        diff < 0 ? locationId : null,
        diff > 0 ? locationId : null,
        reason || 'Cycle Count',
        req.user!.id
      ]
    );
    const op = opRes.rows[0];

    // 3. Add item (store absolute diff as quantity)
    await client.query(
      'INSERT INTO operation_items (operation_id, product_id, quantity) VALUES ($1, $2, $3)',
      [op.id, productId, Math.abs(diff)]
    );

    await client.query('COMMIT');
    
    // 4. Validate immediately to apply changes
    req.params.id = op.id;
    return validateOperation(req, res);
  } catch (err: any) {
    await client.query('ROLLBACK');
    return res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
}

// ============================================
// HELPERS
// ============================================
export async function getStock(req: AuthRequest, res: Response) {
  const resu = await pool.query('SELECT * FROM stock');
  res.json(resu.rows);
}
export async function getWarehouses(req: AuthRequest, res: Response) {
  const resu = await pool.query('SELECT * FROM warehouses');
  res.json(resu.rows);
}
export async function getLocations(req: AuthRequest, res: Response) {
  const resu = await pool.query('SELECT * FROM locations');
  res.json(resu.rows);
}
export async function getMoveHistory(req: AuthRequest, res: Response) {
  const resu = await pool.query('SELECT * FROM move_history ORDER BY timestamp DESC');
  res.json(resu.rows);
}
export async function seedDemoData(req: AuthRequest, res: Response) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const wh1 = await client.query(`INSERT INTO warehouses (name, code, address) VALUES ($1, $2, $3) RETURNING id`, ['Main Warehouse', 'WH-MAIN', '123 Industrial Way']);
    await client.query(`INSERT INTO locations (name, code, warehouse_id, type) VALUES ($1, $2, $3, $4)`, ['Shelf A1', 'A1', wh1.rows[0].id, 'internal']);
    await client.query(`INSERT INTO products (name, sku, category, uom, description, reorder_level) VALUES ($1, $2, $3, $4, $5, $6)`, ['Steel Rods', 'SR-001', 'Raw Material', 'kg', 'High grade steel rods', 10]);
    await client.query('COMMIT');
    return res.json({ message: 'Demo data seeded successfully' });
  } catch (err: any) {
    await client.query('ROLLBACK');
    return res.status(400).json({ error: 'Seed failed or already seeded' });
  } finally {
    client.release();
  }
}

export async function addInventory(req: AuthRequest, res: Response) {
  const { productId, locationId, quantity } = req.body;
  await pool.query(`INSERT INTO stock (product_id, location_id, quantity) VALUES ($1, $2, $3) ON CONFLICT(product_id, location_id) DO UPDATE SET quantity = stock.quantity + $3`, [productId, locationId, quantity]);
  res.json({ success: true });
}
