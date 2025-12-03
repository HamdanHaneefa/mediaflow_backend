// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import env from '../config/env';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../utils/errors';

const prisma = new PrismaClient();

export class ClientAuthService {
  /**
   * Register a new client user
   */
  async register(data: {
    contactId: string;
    email: string;
    password: string;
  }): Promise<{ clientUser: any; verificationToken: string }> {
    // Check if contact exists
    const contact = await prisma.contacts.findUnique({
      where: { id: data.contactId },
    });

    if (!contact) {
      throw new NotFoundError('Contact not found');
    }

    // Check if email matches contact
    if (contact.email !== data.email) {
      throw new BadRequestError('Email does not match contact record');
    }

    // Check if client user already exists
    const existing = await prisma.client_users.findFirst({
      where: {
        OR: [
          { email: data.email },
          { contact_id: data.contactId },
        ],
      },
    });

    if (existing) {
      throw new BadRequestError('Client portal account already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create client user
    const clientUser = await prisma.client_users.create({
      data: {
        contact_id: data.contactId,
        email: data.email,
        password_hash: passwordHash,
        verification_token: verificationToken,
        is_verified: false,
      },
      include: {
        contact: true,
      },
    });

    return { clientUser, verificationToken };
  }

  /**
   * Login client user
   */
  async login(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ clientUser: any; token: string; expiresIn: string }> {
    // Find client user
    const clientUser = await prisma.client_users.findUnique({
      where: { email },
      include: { contact: true },
    });

    if (!clientUser) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!clientUser.is_active) {
      throw new UnauthorizedError('Account is inactive');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, clientUser.password_hash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Generate JWT token
    const jwtSecret = env.CLIENT_JWT_SECRET || env.JWT_SECRET;
    const expiresIn = env.CLIENT_JWT_EXPIRES_IN || '24h';

    const token = jwt.sign(
      {
        clientUserId: clientUser.id,
        contactId: clientUser.contact_id,
        email: clientUser.email,
      },
      jwtSecret,
      { expiresIn }
    );

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

    // Create session
    await prisma.client_sessions.create({
      data: {
        client_user_id: clientUser.id,
        token,
        ip_address: ipAddress,
        user_agent: userAgent,
        expires_at: expiresAt,
      },
    });

    // Update last login
    await prisma.client_users.update({
      where: { id: clientUser.id },
      data: { last_login: new Date() },
    });

    // Log activity
    await prisma.client_activities.create({
      data: {
        client_user_id: clientUser.id,
        action: 'login',
        ip_address: ipAddress,
        user_agent: userAgent,
      },
    });

    return { clientUser, token, expiresIn };
  }

  /**
   * Logout client user
   */
  async logout(clientUserId: string, token: string): Promise<void> {
    // Delete session
    await prisma.client_sessions.deleteMany({
      where: {
        client_user_id: clientUserId,
        token,
      },
    });

    // Log activity
    await prisma.client_activities.create({
      data: {
        client_user_id: clientUserId,
        action: 'logout',
      },
    });
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<string> {
    const clientUser = await prisma.client_users.findUnique({
      where: { email },
    });

    if (!clientUser) {
      // Don't reveal if user exists
      return 'If an account exists, a password reset email will be sent';
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date();
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 1); // 1 hour

    await prisma.client_users.update({
      where: { id: clientUser.id },
      data: {
        reset_token: resetToken,
        reset_token_expires: resetTokenExpires,
      },
    });

    return resetToken;
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const clientUser = await prisma.client_users.findFirst({
      where: {
        reset_token: token,
        reset_token_expires: {
          gt: new Date(),
        },
      },
    });

    if (!clientUser) {
      throw new BadRequestError('Invalid or expired reset token');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await prisma.client_users.update({
      where: { id: clientUser.id },
      data: {
        password_hash: passwordHash,
        reset_token: null,
        reset_token_expires: null,
      },
    });

    // Delete all sessions (force re-login)
    await prisma.client_sessions.deleteMany({
      where: { client_user_id: clientUser.id },
    });

    // Log activity
    await prisma.client_activities.create({
      data: {
        client_user_id: clientUser.id,
        action: 'password_reset',
      },
    });
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<void> {
    const clientUser = await prisma.client_users.findFirst({
      where: { verification_token: token },
    });

    if (!clientUser) {
      throw new BadRequestError('Invalid verification token');
    }

    if (clientUser.is_verified) {
      throw new BadRequestError('Email already verified');
    }

    // Mark as verified
    await prisma.client_users.update({
      where: { id: clientUser.id },
      data: {
        is_verified: true,
        verification_token: null,
      },
    });

    // Log activity
    await prisma.client_activities.create({
      data: {
        client_user_id: clientUser.id,
        action: 'email_verified',
      },
    });
  }

  /**
   * Resend verification email
   */
  async resendVerification(email: string): Promise<string> {
    const clientUser = await prisma.client_users.findUnique({
      where: { email },
    });

    if (!clientUser) {
      throw new NotFoundError('Client user not found');
    }

    if (clientUser.is_verified) {
      throw new BadRequestError('Email already verified');
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    await prisma.client_users.update({
      where: { id: clientUser.id },
      data: { verification_token: verificationToken },
    });

    return verificationToken;
  }

  /**
   * Change password (authenticated)
   */
  async changePassword(
    clientUserId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const clientUser = await prisma.client_users.findUnique({
      where: { id: clientUserId },
    });

    if (!clientUser) {
      throw new NotFoundError('Client user not found');
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, clientUser.password_hash);
    if (!isValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.client_users.update({
      where: { id: clientUserId },
      data: { password_hash: passwordHash },
    });

    // Log activity
    await prisma.client_activities.create({
      data: {
        client_user_id: clientUserId,
        action: 'password_changed',
      },
    });
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    const result = await prisma.client_sessions.deleteMany({
      where: {
        expires_at: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  }
}

export default new ClientAuthService();
