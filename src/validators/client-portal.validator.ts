import { z } from 'zod';

/**
 * Dashboard Query Schema
 */
export const dashboardQuerySchema = z.object({
  period: z.enum(['week', 'month', 'quarter', 'year', 'all']).optional().default('month'),
});

/**
 * Projects List Query Schema
 */
export const projectsListSchema = z.object({
  status: z.string().optional(),
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  sortBy: z.string().optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * Project Comment Schema
 */
export const projectCommentSchema = z.object({
  comment: z.string().min(1, 'Comment is required').max(2000, 'Comment is too long'),
});

/**
 * Invoices List Query Schema
 */
export const invoicesListSchema = z.object({
  status: z.string().optional(),
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  sortBy: z.string().optional().default('date'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * Proposals List Query Schema
 */
export const proposalsListSchema = z.object({
  status: z.string().optional(),
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  sortBy: z.string().optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * Proposal Response Schema
 */
export const proposalResponseSchema = z.object({
  status: z.enum(['accepted', 'rejected', 'changes_requested'], {
    errorMap: () => ({ message: 'Invalid response status' }),
  }),
  comments: z.string().max(2000, 'Comments are too long').optional(),
});

/**
 * Documents List Query Schema
 */
export const documentsListSchema = z.object({
  projectId: z.string().uuid().optional(),
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  sortBy: z.string().optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * Document Upload Schema
 */
export const documentUploadSchema = z.object({
  projectId: z.string().uuid().optional(),
  description: z.string().max(500).optional(),
});

/**
 * Messages List Query Schema
 */
export const messagesListSchema = z.object({
  projectId: z.string().uuid().optional(),
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  sortBy: z.string().optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * Send Message Schema
 */
export const sendMessageSchema = z.object({
  projectId: z.string().uuid().optional(),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject is too long'),
  message: z.string().min(1, 'Message is required').max(5000, 'Message is too long'),
  attachments: z.array(z.object({
    filename: z.string(),
    path: z.string(),
    size: z.number(),
  })).optional(),
});

/**
 * Reply to Message Schema
 */
export const replyMessageSchema = z.object({
  message: z.string().min(1, 'Message is required').max(5000, 'Message is too long'),
  attachments: z.array(z.object({
    filename: z.string(),
    path: z.string(),
    size: z.number(),
  })).optional(),
});

/**
 * Notifications List Query Schema
 */
export const notificationsListSchema = z.object({
  type: z.string().optional(),
  isRead: z.enum(['true', 'false']).optional(),
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
});

/**
 * Update Profile Schema
 */
export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});
