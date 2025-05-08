import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authGuard, AuthenticatedRequest } from './middleware/auth';

const prisma = new PrismaClient();
const router = Router();

// 履歴取得
router.get(
  '/',
  authGuard,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const histories = await prisma.history.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: 'desc' },
    });
    res.json(histories);
  }
);

// 履歴追加
router.post(
  '/',
  authGuard,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { guess, hit, blow } = req.body;
    const entry = await prisma.history.create({
      data: { guess, hit, blow, userId: req.userId! },
    });
    res.status(201).json(entry);
  }
);

export default router;
