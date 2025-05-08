import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

// ユーザー登録
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({ data: { email, password: hash } });
    res.status(201).json({ id: user.id, email: user.email });
  } catch (e) {
    res.status(400).json({ error: 'Email already in use' });
  }
});

// ログイン
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

export default router;
