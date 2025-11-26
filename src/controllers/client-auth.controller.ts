import { Request, Response, NextFunction } from 'express';
import clientAuthService from '../services/client-auth.service';
import { sendSuccess } from '../utils/response';

/**
 * Register new client user
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contactId, email, password } = req.body;

    const { clientUser, verificationToken } = await clientAuthService.register({
      contactId,
      email,
      password,
    });

    // TODO: Send verification email with token
    // For now, return token in response (remove in production)
    
    sendSuccess(
      res,
      {
        id: clientUser.id,
        email: clientUser.email,
        isVerified: clientUser.is_verified,
        verificationToken, // Remove in production
      },
      'Registration successful. Please check your email to verify your account.',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Login client user
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.get('user-agent');

    const { clientUser, token, expiresIn } = await clientAuthService.login(
      email,
      password,
      ipAddress,
      userAgent
    );

    sendSuccess(
      res,
      {
        token,
        expiresIn,
        user: {
          id: clientUser.id,
          email: clientUser.email,
          name: clientUser.contact.name,
          company: clientUser.contact.company,
          isVerified: clientUser.is_verified,
        },
      },
      'Login successful'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Logout client user
 */
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.clientUser) {
      return sendSuccess(res, null, 'Logged out successfully');
    }

    const token = req.headers.authorization?.substring(7);
    if (token) {
      await clientAuthService.logout(req.clientUser.id, token);
    }

    sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Request password reset
 */
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const resetToken = await clientAuthService.forgotPassword(email);

    // TODO: Send password reset email
    // For now, return token in response (remove in production)

    sendSuccess(
      res,
      { resetToken }, // Remove in production
      'If an account exists, a password reset email will be sent'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password
 */
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;

    await clientAuthService.resetPassword(token, password);

    sendSuccess(res, null, 'Password reset successful. Please log in with your new password.');
  } catch (error) {
    next(error);
  }
};

/**
 * Verify email
 */
export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;

    await clientAuthService.verifyEmail(token);

    sendSuccess(res, null, 'Email verified successfully. You can now log in.');
  } catch (error) {
    next(error);
  }
};

/**
 * Resend verification email
 */
export const resendVerification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const verificationToken = await clientAuthService.resendVerification(email);

    // TODO: Send verification email
    // For now, return token in response (remove in production)

    sendSuccess(
      res,
      { verificationToken }, // Remove in production
      'Verification email sent. Please check your inbox.'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Change password (authenticated)
 */
export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.clientUser) {
      return next(new Error('Authentication required'));
    }

    const { currentPassword, newPassword } = req.body;

    await clientAuthService.changePassword(
      req.clientUser.id,
      currentPassword,
      newPassword
    );

    sendSuccess(res, null, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get current client user
 */
export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.clientUser) {
      return next(new Error('Authentication required'));
    }

    sendSuccess(res, {
      id: req.clientUser.id,
      email: req.clientUser.email,
      name: req.clientUser.contact.name,
      company: req.clientUser.contact.company,
      phone: req.clientUser.contact.phone,
      contactId: req.clientUser.contactId,
    });
  } catch (error) {
    next(error);
  }
};
