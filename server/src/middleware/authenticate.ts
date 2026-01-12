import type { Request, Response, NextFunction } from 'express';
import { firebaseAuth } from '../utils/firebase.js';
import { logger } from '../utils/logger.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    role?: string;
    college?: string;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing Authorization header' });
  }

  const token = header.replace('Bearer ', '');

  try {
    const decoded = await firebaseAuth().verifyIdToken(token);
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      role: decoded.role as string | undefined,
      college: decoded.college as string | undefined,
    };
    return next();
  } catch (error) {
    logger.warn({ error }, 'Failed to verify Firebase token');
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
