import { Router } from 'express';
import { authenticateClient } from '../middleware/client-auth.middleware';
import { validateQuery, validateParams, validateBody } from '../middleware/validation.middleware';
import {
  getMessagesSchema,
  getMessageThreadSchema,
  sendMessageSchema,
} from '../validators/client-extended.validator';
import {
  getConversations,
  getMessageThread,
  sendMessage,
  markMessageAsRead,
  deleteMessage,
  getUnreadMessageCount,
} from '../controllers/client-messaging.controller';

const router = Router();

/**
 * @route   GET /api/client/messages
 * @desc    Get conversations/messages for authenticated client
 * @access  Private (Client)
 */
router.get(
  '/',
  authenticateClient,
  validateQuery(getMessagesSchema),
  getConversations
);

/**
 * @route   GET /api/client/messages/unread-count
 * @desc    Get unread message count
 * @access  Private (Client)
 */
router.get(
  '/unread-count',
  authenticateClient,
  getUnreadMessageCount
);

/**
 * @route   GET /api/client/messages/thread/:threadId
 * @desc    Get message thread
 * @access  Private (Client)
 */
router.get(
  '/thread/:threadId',
  authenticateClient,
  validateParams(getMessageThreadSchema),
  getMessageThread
);

/**
 * @route   POST /api/client/messages
 * @desc    Send message
 * @access  Private (Client)
 */
router.post(
  '/',
  authenticateClient,
  validateBody(sendMessageSchema),
  sendMessage
);

/**
 * @route   PUT /api/client/messages/:messageId/read
 * @desc    Mark message as read
 * @access  Private (Client)
 */
router.put(
  '/:messageId/read',
  authenticateClient,
  markMessageAsRead
);

/**
 * @route   DELETE /api/client/messages/:messageId
 * @desc    Delete message
 * @access  Private (Client)
 */
router.delete(
  '/:messageId',
  authenticateClient,
  deleteMessage
);

export default router;
