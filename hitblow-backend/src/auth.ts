import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

import { authGuard, AuthReq } from './middleware/auth';

const prisma = new PrismaClient();
const router = Router();
const JWT_SECRET = process.env.JWT_SECRET!;

// Register
router.post('/register', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: { email, password: hash }
    });
    // 登録後にトークンも返す
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token });
  } catch (e: any) {
    // ユニーク制約違反
    if (e.code === 'P2002' && e.meta?.target?.includes('email')) {
      res.status(400).json({ error: 'このメールアドレスは既に登録されています' });
    } else {
      res.status(500).json({ error: 'サーバーエラー' });
    }
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ error: '認証に失敗しました' });
    return;
  }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});
/**
 * プロフィール取得エンドポイント
 */
router.get(
  '/profile',
  authGuard,
  // コールバックは必ず「void を返す」ようにする
  async (req: AuthReq, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId! },
        select: { id: true, email: true }
      });
      if (!user) {
        // 「return」を外して、void を返す
        res.status(404).json({ error: 'ユーザーが見つかりません' });
        return;
      }
      // 同様に void
      res.json(user);
    } catch (err) {
      // エラーは next() に渡す
      next(err);
    }
  }
);

export default router;
