import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthReq extends Request {
  userId?: number;
}

export function authGuard(
  req: AuthReq,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  if (!header) {
    res.status(401).json({ error: 'トークンが必要です' });
    return;
  }
  const token = header.replace(/^Bearer\s+/, '');
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: '無効なトークンです' });
  }
}
