// @ts-nocheck
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import env from '../config/env';
import { UnauthorizedError } from '../utils/errors';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    permissions: any;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as any;

      // Fetch user from database
      const user = await prisma.team_members.findUnique({
        where: { id: decoded.id },  // ✅ Fixed: Use 'id' not 'userId'
        select: {
          id: true,
          email: true,
          role: true,
          permissions: true,
          status: true,
        },
      });

      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      if (user.status !== 'active') {  // ✅ Fixed: lowercase 'active'
        throw new UnauthorizedError('Account is not active');
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      };

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid token');
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as any;
        
        const user = await prisma.team_members.findUnique({
          where: { id: decoded.id },  // ✅ Fixed: Use 'id' not 'userId'
          select: {
            id: true,
            email: true,
            role: true,
            permissions: true,
          },
        });

        if (user) {
          req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            permissions: user.permissions,
          };
        }
      } catch (error) {
        // Ignore token errors in optional auth
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const requirePermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const permissions = req.user.permissions as any;

      if (!permissions || !permissions[permission]) {
        throw new UnauthorizedError(`Permission '${permission}' required`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      if (!roles.includes(req.user.role)) {
        throw new UnauthorizedError(`Role ${roles.join(' or ')} required`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
