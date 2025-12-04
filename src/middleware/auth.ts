import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { AppErrorClass } from './errorHandler';

// Extend Express Request to include user
export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
  try {
    // 1) Get token from cookies
    let token: string | undefined;
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new AppErrorClass('You are not logged in. Please log in to get access.', 401);
    }

    // 2) Verify token
    const decoded = verifyToken(token) as TokenPayload;

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id).select('+password');
    if (!currentUser) {
      throw new AppErrorClass('The user belonging to this token no longer exists.', 401);
    }

    // 4) Check if user changed password after token was issued
    if (currentUser.passwordChangedAt) {
      const changedTimestamp = Math.floor(currentUser.passwordChangedAt.getTime() / 1000);
      if (decoded.iat && decoded.iat < changedTimestamp) {
        throw new AppErrorClass('User recently changed password. Please log in again.', 401);
      }
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};

export const restrictTo = (...roles: ('staff' | 'admin')[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppErrorClass('You are not authorized to access this route.', 403);
    }

    if (!roles.includes(req.user.role)) {
      throw new AppErrorClass('You do not have permission to perform this action.', 403);
    }

    next();
  };
};
