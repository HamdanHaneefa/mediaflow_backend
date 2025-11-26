import { Request, Response, NextFunction } from 'express';
import clientNotificationsService from '../services/client-notifications.service';
import { sendSuccess } from '../utils/response';

/**
 * Get notifications for authenticated client
 */
export const getNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const clientUserId = req.user!.id;
    const { page, limit, unread_only } = req.query;

    const result = await clientNotificationsService.getNotifications(
      clientUserId,
      page ? parseInt(page as string) : 1,
      limit ? parseInt(limit as string) : 20,
      unread_only === 'true'
    );

    sendSuccess(res, result, 'Notifications retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const clientUserId = req.user!.id;
    const { notificationId } = req.params;

    const notification = await clientNotificationsService.markAsRead(
      notificationId,
      clientUserId
    );

    sendSuccess(res, notification, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const clientUserId = req.user!.id;

    const result = await clientNotificationsService.markAllAsRead(clientUserId);

    sendSuccess(res, result, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete notification
 */
export const deleteNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const clientUserId = req.user!.id;
    const { notificationId } = req.params;

    const result = await clientNotificationsService.deleteNotification(
      notificationId,
      clientUserId
    );

    sendSuccess(res, result, 'Notification deleted');
  } catch (error) {
    next(error);
  }
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const clientUserId = req.user!.id;

    const result = await clientNotificationsService.getUnreadCount(clientUserId);

    sendSuccess(res, result, 'Unread count retrieved');
  } catch (error) {
    next(error);
  }
};
