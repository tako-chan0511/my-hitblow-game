import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

export interface AuthenticatedRequest extends Request {
  userId?: number;
}

export function authGuard(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization?.split(' ')[1];
  if (!authHeader) {
    res.status(401).json({ error: 'No token' });
    return;
  }
  try {
    const payload = jwt.verify(authHeader, JWT_SECRET) as { userId: number };
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }
}
