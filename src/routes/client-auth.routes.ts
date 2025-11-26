import { Router } from 'express';
import * as clientAuthController from '../controllers/client-auth.controller';
import { authenticateClient } from '../middleware/client-auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import {
  clientRegisterSchema,
  clientLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  changePasswordSchema,
} from '../validators/client-auth.validator';

const router = Router();

/**
 * @route   POST /api/client/auth/register
 * @desc    Register new client user
 * @access  Public
 */
router.post('/register', validateBody(clientRegisterSchema), clientAuthController.register);

/**
 * @route   POST /api/client/auth/login
 * @desc    Login client user
 * @access  Public
 */
router.post('/login', validateBody(clientLoginSchema), clientAuthController.login);

/**
 * @route   POST /api/client/auth/logout
 * @desc    Logout client user
 * @access  Private (Client)
 */
router.post('/logout', authenticateClient, clientAuthController.logout);

/**
 * @route   POST /api/client/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password', validateBody(forgotPasswordSchema), clientAuthController.forgotPassword);

/**
 * @route   POST /api/client/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password', validateBody(resetPasswordSchema), clientAuthController.resetPassword);

/**
 * @route   POST /api/client/auth/verify-email
 * @desc    Verify email address
 * @access  Public
 */
router.post('/verify-email', validateBody(verifyEmailSchema), clientAuthController.verifyEmail);

/**
 * @route   POST /api/client/auth/resend-verification
 * @desc    Resend verification email
 * @access  Public
 */
router.post('/resend-verification', validateBody(forgotPasswordSchema), clientAuthController.resendVerification);

/**
 * @route   POST /api/client/auth/change-password
 * @desc    Change password (authenticated)
 * @access  Private (Client)
 */
router.post('/change-password', authenticateClient, validateBody(changePasswordSchema), clientAuthController.changePassword);

/**
 * @route   GET /api/client/auth/me
 * @desc    Get current client user
 * @access  Private (Client)
 */
router.get('/me', authenticateClient, clientAuthController.getCurrentUser);

export default router;
