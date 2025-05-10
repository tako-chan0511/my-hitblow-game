import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authGuard, AuthReq } from './middleware/auth';

const prisma = new PrismaClient();
const router = Router();

/**
 * GET /history/completed
 */
router.get(
  '/completed',
  authGuard,
  async (req: AuthReq, res: Response): Promise<void> => {
    try {
      const list = await prisma.completedGame.findMany({
        where: { userId: req.userId! },
        orderBy: { finishedAt: 'desc' },
      });
      res.json(list);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: '履歴取得に失敗しました' });
    }
  }
);

/**
 * POST /history/completed
 */
router.post(
  '/completed',
  authGuard,
  async (req: AuthReq, res: Response): Promise<void> => {
    const { digitCount, attempts } = req.body;
    if (typeof digitCount !== 'number' || typeof attempts !== 'number') {
      res.status(400).json({
        error: 'digitCount と attempts は数値で指定してください',
      });
      return;
    }

    try {
      const entry = await prisma.completedGame.create({
        data: {
          digitCount,
          attempts,
          userId: req.userId!,
          // finishedAt は @default(now()) で自動設定
        },
      });
      res.status(201).json(entry);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: '履歴登録に失敗しました' });
    }
  }
);

export default router;
