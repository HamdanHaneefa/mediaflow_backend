import { z } from 'zod';

/**
 * Get Notifications Schema
 */
export const getNotificationsSchema = z.object({
  page: z.string().optional().transform(val => (val ? parseInt(val) : 1)),
  limit: z.string().optional().transform(val => (val ? parseInt(val) : 20)),
  unread_only: z.string().optional().transform(val => val === 'true'),
});

/**
 * Mark Notification as Read Schema
 */
export const markNotificationAsReadSchema = z.object({
  notificationId: z.string().uuid('Invalid notification ID'),
});

/**
 * Get Messages Schema
 */
export const getMessagesSchema = z.object({
  page: z.string().optional().transform(val => (val ? parseInt(val) : 1)),
  limit: z.string().optional().transform(val => (val ? parseInt(val) : 20)),
});

/**
 * Get Message Thread Schema
 */
export const getMessageThreadSchema = z.object({
  threadId: z.string().uuid('Invalid thread ID'),
  page: z.string().optional().transform(val => (val ? parseInt(val) : 1)),
  limit: z.string().optional().transform(val => (val ? parseInt(val) : 50)),
});

/**
 * Send Message Schema
 */
export const sendMessageSchema = z.object({
  recipient_id: z.string().uuid('Invalid recipient ID'),
  subject: z.string().max(200).optional(),
  message: z.string().min(1, 'Message is required').max(10000),
  thread_id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
});

/**
 * Get Documents Schema
 */
export const getDocumentsSchema = z.object({
  page: z.string().optional().transform(val => (val ? parseInt(val) : 1)),
  limit: z.string().optional().transform(val => (val ? parseInt(val) : 20)),
  type: z.string().optional(),
  project_id: z.string().uuid().optional(),
});

/**
 * Upload Document Schema
 */
export const uploadDocumentSchema = z.object({
  name: z.string().min(1, 'Document name is required').max(255),
  description: z.string().max(1000).optional(),
  type: z.enum(['contract', 'invoice', 'receipt', 'proposal', 'deliverable', 'other']),
  project_id: z.string().uuid().optional(),
});
