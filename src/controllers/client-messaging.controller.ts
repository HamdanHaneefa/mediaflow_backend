import { Request, Response, NextFunction } from 'express';
import clientMessagingService from '../services/client-messaging.service';
import { sendSuccess } from '../utils/response';

/**
 * Get conversations/messages
 */
export const getConversations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const clientUserId = req.user!.id;
    const { page, limit } = req.query;

    const result = await clientMessagingService.getConversations(
      clientUserId,
      page ? parseInt(page as string) : 1,
      limit ? parseInt(limit as string) : 20
    );

    sendSuccess(res, result, 'Conversations retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get message thread
 */
export const getMessageThread = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const clientUserId = req.user!.id;
    const { threadId } = req.params;
    const { page, limit } = req.query;

    const result = await clientMessagingService.getMessageThread(
      clientUserId,
      threadId,
      page ? parseInt(page as string) : 1,
      limit ? parseInt(limit as string) : 50
    );

    sendSuccess(res, result, 'Message thread retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Send message
 */
export const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const clientUserId = req.user!.id;
    const { recipient_id, subject, message, thread_id, project_id } = req.body;

    const newMessage = await clientMessagingService.sendMessage({
      sender_id: clientUserId,
      recipient_id,
      subject,
      message,
      thread_id,
      project_id,
    });

    sendSuccess(res, newMessage, 'Message sent successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Mark message as read
 */
export const markMessageAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const clientUserId = req.user!.id;
    const { messageId } = req.params;

    const message = await clientMessagingService.markAsRead(messageId, clientUserId);

    sendSuccess(res, message, 'Message marked as read');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete message
 */
export const deleteMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const clientUserId = req.user!.id;
    const { messageId } = req.params;

    const result = await clientMessagingService.deleteMessage(messageId, clientUserId);

    sendSuccess(res, result, 'Message deleted');
  } catch (error) {
    next(error);
  }
};

/**
 * Get unread message count
 */
export const getUnreadMessageCount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const clientUserId = req.user!.id;

    const result = await clientMessagingService.getUnreadCount(clientUserId);

    sendSuccess(res, result, 'Unread message count retrieved');
  } catch (error) {
    next(error);
  }
};
