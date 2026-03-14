import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'coreinventory-secret-key';

export const signup = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role || 'Viewer',
      },
    });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err: any) {
    res.status(500).json({ error: 'Login failed' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // As per user request: "any mail" should work, but we still verify it exists.
    // In a real app, send mail here. We'll return success to let frontend show OTP step.
    res.json({ 
      message: 'OTP sent to your email. (Hint: Use 395455 or 192903)',
      email 
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Request failed' });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  const validOtps = ['395455', '192903'];

  try {
    if (!validOtps.includes(otp)) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const resetToken = jwt.sign({ id: user.id, purpose: 'reset' }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'OTP verified', resetToken });
  } catch (err: any) {
    res.status(500).json({ error: 'Verification failed' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { resetToken, newPassword } = req.body;
  try {
    const decoded: any = jwt.verify(resetToken, JWT_SECRET);
    if (decoded.purpose !== 'reset') throw new Error('Invalid token');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: decoded.id },
      data: { passwordHash },
    });

    res.json({ message: 'Password updated successfully' });
  } catch (err: any) {
    res.status(400).json({ error: 'Invalid or expired token' });
  }
};

export const getMe = async (req: any, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};
