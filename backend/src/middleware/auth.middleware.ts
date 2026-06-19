import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from HTTP-only cookie
    const token = req.cookies?.token;

    if (!token) {
      res.status(401).json({ message: 'Not authorized. Please log in.' });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({ message: 'JWT secret not configured' });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, secret) as JwtPayload;

    // Fetch user (exclude password)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(401).json({ message: 'User not found. Token invalid.' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalid or expired. Please log in again.' });
  }
};
