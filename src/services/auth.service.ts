import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/crypto';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, generatePasswordResetToken, verifyPasswordResetToken } from '../utils/jwt';
import { BadRequestError, UnauthorizedError, NotFoundError } from '../utils/errors';
import logger from '../utils/logger';
import {
  RegisterInput,
  LoginInput,
} from '../validators/auth.validator';

// Token blacklist (in production, use Redis)
const tokenBlacklist = new Set<string>();

export const register = async (data: RegisterInput) => {
  const { email, password, firstName, lastName, phone } = data;

  // Check if user already exists
  const existingUser = await prisma.team_members.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new BadRequestError('Email already registered');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await prisma.team_members.create({
    data: {
      email,
      password: hashedPassword,
      first_name: firstName,
      last_name: lastName,
      phone,
      role: 'member', // Default role
      status: 'active',
      permissions: {},
    },
    select: {
      id: true,
      email: true,
      first_name: true,
      last_name: true,
      role: true,
      status: true,
      created_at: true,
    },
  });

  // Generate tokens
  const accessToken = generateAccessToken(user.id, user.email, user.role);
  const refreshToken = generateRefreshToken(user.id, user.email, user.role);

  logger.info(`User registered: ${user.email}`);

  return {
    user,
    accessToken,
    refreshToken,
  };
};

export const login = async (data: LoginInput) => {
  const { email, password } = data;

  // Find user
  const user = await prisma.team_members.findUnique({
    where: { email },
  });

  if (!user || !user.password) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Check if user is active
  if (user.status !== 'active') {
    throw new UnauthorizedError('Your account is not active');
  }

  // Verify password
  const isValidPassword = await comparePassword(password, user.password);
  if (!isValidPassword) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Generate tokens
  const accessToken = generateAccessToken(user.id, user.email, user.role);
  const refreshToken = generateRefreshToken(user.id, user.email, user.role);

  logger.info(`User logged in: ${user.email}`);

  return {
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      status: user.status,
      avatar_url: user.avatar_url,
      permissions: user.permissions,
    },
    accessToken,
    refreshToken,
  };
};

export const refreshToken = async (token: string) => {
  // Check if token is blacklisted
  if (tokenBlacklist.has(token)) {
    throw new UnauthorizedError('Token has been revoked');
  }

  // Verify refresh token
  const decoded = verifyRefreshToken(token);

  // Find user
  const user = await prisma.team_members.findUnique({
    where: { id: decoded.id },
  });

  if (!user || user.status !== 'active') {
    throw new UnauthorizedError('User not found or inactive');
  }

  // Generate new tokens
  const accessToken = generateAccessToken(user.id, user.email, user.role);
  const newRefreshToken = generateRefreshToken(user.id, user.email, user.role);

  // Blacklist old refresh token
  tokenBlacklist.add(token);

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};

export const logout = async (token: string) => {
  // Add token to blacklist
  tokenBlacklist.add(token);
  logger.info('User logged out');
};

export const getCurrentUser = async (userId: string) => {
  const user = await prisma.team_members.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      first_name: true,
      last_name: true,
      role: true,
      status: true,
      avatar_url: true,
      phone: true,
      position: true,
      department: true,
      permissions: true,
      created_at: true,
      updated_at: true,
    },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
};

export const forgotPassword = async (email: string) => {
  const user = await prisma.team_members.findUnique({
    where: { email },
  });

  if (!user) {
    // Don't reveal if user exists
    logger.info(`Password reset requested for non-existent email: ${email}`);
    return;
  }

  // Generate reset token
  const resetToken = generatePasswordResetToken(user.id, user.email);

  // In production, send email with reset link
  // For now, just log it
  logger.info(`Password reset token for ${email}: ${resetToken}`);
  logger.warn('TODO: Implement email sending service');

  // You would typically send an email here:
  // await emailService.sendPasswordResetEmail(user.email, resetToken);
};

export const resetPassword = async (token: string, newPassword: string) => {
  // Verify reset token
  const decoded = verifyPasswordResetToken(token);

  // Find user
  const user = await prisma.team_members.findUnique({
    where: { id: decoded.id, email: decoded.email },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password
  await prisma.team_members.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  logger.info(`Password reset for user: ${user.email}`);
};

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  // Find user
  const user = await prisma.team_members.findUnique({
    where: { id: userId },
  });

  if (!user || !user.password) {
    throw new NotFoundError('User not found');
  }

  // Verify current password
  const isValidPassword = await comparePassword(currentPassword, user.password);
  if (!isValidPassword) {
    throw new BadRequestError('Current password is incorrect');
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password
  await prisma.team_members.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  logger.info(`Password changed for user: ${user.email}`);
};
