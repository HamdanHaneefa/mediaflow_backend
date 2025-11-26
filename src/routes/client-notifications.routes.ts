import { Router } from 'express';
import { authenticateClient } from '../middleware/client-auth.middleware';
import { validateQuery, validateParams } from '../middleware/validation.middleware';
import {
  getNotificationsSchema,
  markNotificationAsReadSchema,
} from '../validators/client-extended.validator';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} from '../controllers/client-notifications.controller';

const router = Router();

/**
 * @route   GET /api/client/notifications
 * @desc    Get notifications for authenticated client
 * @access  Private (Client)
 */
router.get(
  '/',
  authenticateClient,
  validateQuery(getNotificationsSchema),
  getNotifications
);

/**
 * @route   GET /api/client/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private (Client)
 */
router.get(
  '/unread-count',
  authenticateClient,
  getUnreadCount
);

/**
 * @route   PUT /api/client/notifications/:notificationId/read
 * @desc    Mark notification as read
 * @access  Private (Client)
 */
router.put(
  '/:notificationId/read',
  authenticateClient,
  validateParams(markNotificationAsReadSchema),
  markAsRead
);

/**
 * @route   PUT /api/client/notifications/mark-all-read
 * @desc    Mark all notifications as read
 * @access  Private (Client)
 */
router.put(
  '/mark-all-read',
  authenticateClient,
  markAllAsRead
);

/**
 * @route   DELETE /api/client/notifications/:notificationId
 * @desc    Delete notification
 * @access  Private (Client)
 */
router.delete(
  '/:notificationId',
  authenticateClient,
  validateParams(markNotificationAsReadSchema),
  deleteNotification
);

export default router;
