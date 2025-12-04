import jwt, { SignOptions } from 'jsonwebtoken';
import env from './env';

export interface TokenPayload {
  id: string;
  email: string;
  role: 'staff' | 'admin';
  iat?: number;
  exp?: number;
}

export const signToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as SignOptions);
};

export const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};
