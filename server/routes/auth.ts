import { Router, Response, Request } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db/pool';
import { generateToken, authMiddleware, AuthRequest } from '../middleware/auth';
import { sendEmail } from '../utils/sendEmail';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiters
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: 'Too many requests, please try again later.' 
});

const verifyOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many blocked attempts.' 
});// POST /api/auth/signup
router.post('/signup', async (req, res: Response) => {
  const { loginId, email, password, role } = req.body;

  try {
    // Validate loginId length
    if (!loginId || loginId.length < 6 || loginId.length > 12) {
      return res.status(400).json({ error: 'Login ID must be between 6-12 characters.' });
    }

    // Check for unique loginId
    const existingLogin = await pool.query('SELECT id FROM users WHERE login_id = $1', [loginId]);
    if (existingLogin.rows.length > 0) {
      return res.status(400).json({ error: 'Login ID already exists.' });
    }

    // Check for unique email
    const existingEmail = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingEmail.rows.length > 0) {
      return res.status(400).json({ error: 'Email ID already exists.' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, display_name, login_id, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, display_name, login_id, role, created_at`,
      [email, passwordHash, loginId, loginId, role || 'viewer']
    );

    const user = result.rows[0];
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      loginId: user.login_id,
      displayName: user.display_name,
    });

    return res.status(201).json({
      token,
      user: {
        uid: user.id,
        email: user.email,
        displayName: user.display_name,
        loginId: user.login_id,
        role: user.role,
        createdAt: user.created_at,
      },
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Failed to create account.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res: Response) => {
  const { loginId, password } = req.body;

  try {
    // Find user by loginId
    const result = await pool.query(
      'SELECT * FROM users WHERE login_id = $1',
      [loginId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid Login Id or Password' });
    }

    const user = result.rows[0];

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid Login Id or Password' });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      loginId: user.login_id,
      displayName: user.display_name,
    });

    return res.json({
      token,
      user: {
        uid: user.id,
        email: user.email,
        displayName: user.display_name,
        loginId: user.login_id,
        role: user.role,
        createdAt: user.created_at,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed.' });
  }
});

// GET /api/auth/me — get current user profile
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, email, display_name, login_id, role, created_at FROM users WHERE id = $1',
      [req.user!.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    return res.json({
      uid: user.id,
      email: user.email,
      displayName: user.display_name,
      loginId: user.login_id,
      role: user.role,
      createdAt: user.created_at,
    });
  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// POST /api/auth/forgot-password - Generate and send OTP
router.post('/forgot-password', forgotPasswordLimiter, async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    let user;
    const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      // Auto-create user so the reset flow works for ANY email as requested
      const dummyPasswordHash = await bcrypt.hash('DemoPass123!', 12);
      const loginId = 'user' + Math.floor(1000 + Math.random() * 9000); // random 8 char
      const newResult = await pool.query(
        `INSERT INTO users (email, password_hash, display_name, login_id, role)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [email, dummyPasswordHash, 'Demo User', loginId, 'staff']
      );
      user = newResult.rows[0];
    } else {
      user = result.rows[0];
    }
    
    // Generate specific 6-digit OTP per user request
    const otps = ['395455', '192903'];
    const otp = otps[Math.floor(Math.random() * otps.length)];
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store OTP in database
    await pool.query('DELETE FROM password_resets WHERE user_id = $1', [user.id]);
    await pool.query(
      'INSERT INTO password_resets (user_id, otp_code, expires_at) VALUES ($1, $2, $3)',
      [user.id, otp, expiresAt]
    );

    // Send email
    await sendEmail({
      to: email,
      subject: 'CoreInventory Password Reset OTP',
      text: `Your OTP code for resetting your password is: ${otp}\n\nThis code expires in 5 minutes.`
    });

    return res.status(200).json({ message: 'If an account exists with this email, an OTP has been sent.' });
  } catch (err: any) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ error: 'Failed to process request.' });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', verifyOtpLimiter, async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  try {
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) return res.status(400).json({ error: 'Invalid request' });
    const user = userResult.rows[0];

    // Master OTP bypass as requested
    if (otp === '395455' || otp === '192903') {
      const resetToken = jwt.sign({ userId: user.id, purpose: 'reset' }, process.env.JWT_SECRET as string, { expiresIn: '15m' });
      return res.status(200).json({ message: 'OTP Verified', resetToken });
    }

    const resetResult = await pool.query('SELECT * FROM password_resets WHERE user_id = $1', [user.id]);
    const resetRecord = resetResult.rows[0];

    if (!resetRecord) return res.status(400).json({ error: 'Invalid or expired OTP' });

    if (new Date() > new Date(resetRecord.expires_at)) {
      await pool.query('DELETE FROM password_resets WHERE user_id = $1', [user.id]);
      return res.status(400).json({ error: 'OTP has expired' });
    }

    if (resetRecord.invalid_attempts >= 5) {
      await pool.query('DELETE FROM password_resets WHERE user_id = $1', [user.id]);
      return res.status(400).json({ error: 'Too many invalid attempts. Request a new OTP.' });
    }

    if (resetRecord.otp_code !== otp) {
      await pool.query('UPDATE password_resets SET invalid_attempts = invalid_attempts + 1 WHERE id = $1', [resetRecord.id]);
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Success - Generate a temporary reset token valid for 15 mins to do the final reset
    const resetToken = jwt.sign({ userId: user.id, purpose: 'reset' }, process.env.JWT_SECRET as string, { expiresIn: '15m' });

    return res.status(200).json({ message: 'OTP Verified', resetToken });
  } catch (err: any) {
    console.error('Verify OTP error:', err);
    return res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req: Request, res: Response) => {
  const { newPassword, resetToken } = req.body;

  try {
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET as string) as any;
    if (decoded.purpose !== 'reset') return res.status(400).json({ error: 'Invalid token' });
    
    const userId = decoded.userId;

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, userId]);
    await pool.query('DELETE FROM password_resets WHERE user_id = $1', [userId]);

    return res.status(200).json({ message: 'Password successfully reset' });
  } catch (err: any) {
    console.error('Reset password error:', err);
    return res.status(400).json({ error: 'Invalid or expired session' });
  }
});

export default router;
