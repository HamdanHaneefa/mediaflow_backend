import { Router } from 'express';
import { authLimiter } from '../middleware/rateLimit.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import * as authController from '../controllers/auth.controller';
import * as authValidator from '../validators/auth.validator';

const router = Router();

// Public routes with rate limiting
router.post(
  '/register',
  authLimiter,
  validate(authValidator.registerSchema),
  authController.register
);

router.post(
  '/login',
  authLimiter,
  validate(authValidator.loginSchema),
  authController.login
);

router.post(
  '/refresh',
  authLimiter,
  validate(authValidator.refreshTokenSchema),
  authController.refreshToken
);

router.post(
  '/forgot-password',
  authLimiter,
  validate(authValidator.forgotPasswordSchema),
  authController.forgotPassword
);

router.post(
  '/reset-password',
  authLimiter,
  validate(authValidator.resetPasswordSchema),
  authController.resetPassword
);

// Protected routes
router.post('/logout', authenticate, authController.logout);

router.get('/me', authenticate, authController.getCurrentUser);

router.patch(
  '/change-password',
  authenticate,
  validate(authValidator.changePasswordSchema),
  authController.changePassword
);

export default router;
