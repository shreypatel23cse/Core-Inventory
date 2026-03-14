import { Response } from 'express';
import pool from '../config/db.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

// ============================================
// GET /api/users
// Protected — returns all users (admin/manager only)
// ============================================
export async function getAllUsers(req: AuthRequest, res: Response) {
  try {
    const result = await pool.query(
      'SELECT id, email, display_name, login_id, role, created_at FROM users ORDER BY created_at DESC'
    );

    return res.json({
      count: result.rows.length,
      users: result.rows.map(row => ({
        uid: row.id,
        email: row.email,
        displayName: row.display_name,
        loginId: row.login_id,
        role: row.role,
        createdAt: row.created_at,
      })),
    });
  } catch (err: any) {
    console.error('❌ Get users error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
}
