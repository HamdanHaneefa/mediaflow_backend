import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { UnauthorizedError } from '../utils/errors';

const prisma = new PrismaClient();

interface JwtPayload {
  clientUserId: string;
  contactId: string;
  email: string;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      clientUser?: {
        id: string;
        contactId: string;
        email: string;
        contact: any;
      };
    }
  }
}

/**
 * Authenticate client user middleware
 * Verifies JWT token and attaches client user to request
 */
export const authenticateClient = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.CLIENT_JWT_SECRET || process.env.JWT_SECRET || 'your-secret-key'
    ) as JwtPayload;

    // Check if session exists and is valid
    const session = await prisma.client_sessions.findFirst({
      where: {
        token,
        client_user_id: decoded.clientUserId,
        expires_at: {
          gt: new Date(),
        },
      },
    });

    if (!session) {
      throw new UnauthorizedError('Invalid or expired session');
    }

    // Get client user with contact info
    const clientUser = await prisma.client_users.findUnique({
      where: { id: decoded.clientUserId },
      include: {
        contact: true,
      },
    });

    if (!clientUser) {
      throw new UnauthorizedError('Client user not found');
    }

    if (!clientUser.is_active) {
      throw new UnauthorizedError('Account is inactive');
    }

    // Attach client user to request
    req.clientUser = {
      id: clientUser.id,
      contactId: clientUser.contact_id,
      email: clientUser.email,
      contact: clientUser.contact,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token expired'));
    } else {
      next(error);
    }
  }
};

/**
 * Optional client authentication
 * Does not throw error if no token provided
 */
export const optionalClientAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    await authenticateClient(req, res, next);
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
};

/**
 * Check if client is verified
 */
export const requireVerified = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.clientUser) {
      throw new UnauthorizedError('Authentication required');
    }

    const clientUser = await prisma.client_users.findUnique({
      where: { id: req.clientUser.id },
      select: { is_verified: true },
    });

    if (!clientUser?.is_verified) {
      throw new UnauthorizedError('Email verification required');
    }

    next();
  } catch (error) {
    next(error);
  }
};
