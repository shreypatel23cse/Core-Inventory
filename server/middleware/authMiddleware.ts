import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'coreinventory-jwt-secret-change-in-production';

// Extended Request type with user info
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    loginId: string;
    displayName: string;
  };
}

// Generate JWT token
export function generateToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Verify JWT token
export function verifyToken(token: string): any {
  return jwt.verify(token, JWT_SECRET);
}

// ============================================
// AUTH MIDDLEWARE
// ============================================
// Reads token from: Authorization: Bearer <token>
// - If token missing  → 401 "No token provided"
// - If token invalid   → 403 "Invalid token"
// - If token valid     → attaches user to req and calls next()
// ============================================
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  // Check if Authorization header exists and starts with Bearer
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  // Verify the token
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
}

// Role-based access control middleware
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions. Required role: ' + roles.join(' or ') });
    }
    next();
  };
}
