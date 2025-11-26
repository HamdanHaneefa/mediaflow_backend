import { PrismaClient } from '@prisma/client';
import { NotFoundError, ForbiddenError } from '../utils/errors';

const prisma = new PrismaClient();

export class ClientNotificationsService {
  /**
   * Get notifications for client user
   */
  async getNotifications(
    clientUserId: string,
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      client_user_id: clientUserId,
    };

    if (unreadOnly) {
      where.read = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.client_notifications.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.client_notifications.count({ where }),
      prisma.client_notifications.count({
        where: {
          client_user_id: clientUserId,
          read: false,
        },
      }),
    ]);

    return {
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, clientUserId: string) {
    const notification = await prisma.client_notifications.findUnique({
      where: { id: notificationId },
      select: { client_user_id: true },
    });

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    if (notification.client_user_id !== clientUserId) {
      throw new ForbiddenError('Access denied');
    }

    return await prisma.client_notifications.update({
      where: { id: notificationId },
      data: { read: true, read_at: new Date() },
    });
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(clientUserId: string) {
    await prisma.client_notifications.updateMany({
      where: {
        client_user_id: clientUserId,
        read: false,
      },
      data: {
        read: true,
        read_at: new Date(),
      },
    });

    return { success: true, message: 'All notifications marked as read' };
  }

  /**
   * Create notification (internal use)
   */
  async createNotification(data: {
    client_user_id: string;
    type: string;
    title: string;
    message: string;
    data?: any;
  }) {
    return await prisma.client_notifications.create({
      data: {
        ...data,
        data: data.data || {},
      },
    });
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string, clientUserId: string) {
    const notification = await prisma.client_notifications.findUnique({
      where: { id: notificationId },
      select: { client_user_id: true },
    });

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    if (notification.client_user_id !== clientUserId) {
      throw new ForbiddenError('Access denied');
    }

    await prisma.client_notifications.delete({
      where: { id: notificationId },
    });

    return { success: true, message: 'Notification deleted' };
  }

  /**
   * Get unread count
   */
  async getUnreadCount(clientUserId: string) {
    const count = await prisma.client_notifications.count({
      where: {
        client_user_id: clientUserId,
        read: false,
      },
    });

    return { unreadCount: count };
  }
}

export default new ClientNotificationsService();
