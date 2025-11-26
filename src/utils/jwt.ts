import jwt from 'jsonwebtoken';
import env from '../config/env';
import { UnauthorizedError } from './errors';

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
  type: 'access' | 'refresh';
}

export const generateAccessToken = (userId: string, email: string, role: string): string => {
  return jwt.sign(
    { id: userId, email, role, type: 'access' } as JwtPayload,
    env.JWT_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRY }
  );
};

export const generateRefreshToken = (userId: string, email: string, role: string): string => {
  return jwt.sign(
    { id: userId, email, role, type: 'refresh' } as JwtPayload,
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRY }
  );
};

export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    if (decoded.type !== 'access') {
      throw new UnauthorizedError('Invalid token type');
    }
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Access token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid access token');
    }
    throw error;
  }
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
    if (decoded.type !== 'refresh') {
      throw new UnauthorizedError('Invalid token type');
    }
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Refresh token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid refresh token');
    }
    throw error;
  }
};

export const generatePasswordResetToken = (userId: string, email: string): string => {
  return jwt.sign(
    { id: userId, email, type: 'reset' },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

export const verifyPasswordResetToken = (token: string): { id: string; email: string } => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    if (decoded.type !== 'reset') {
      throw new UnauthorizedError('Invalid token type');
    }
    return { id: decoded.id, email: decoded.email };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Password reset token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid password reset token');
    }
    throw error;
  }
};
