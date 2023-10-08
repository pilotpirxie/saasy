import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const jwtVerify = (jwtSecret: string) => (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Missing Authorization Header' });
  }

  if (req.headers.authorization.split(' ')[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Invalid Authorization Header' });
  }

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
    });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = Number(decoded.sub);
    return next();
  } catch (err) {
    return res.sendStatus(401);
  }
};
