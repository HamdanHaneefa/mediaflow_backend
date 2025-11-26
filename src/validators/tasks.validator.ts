import { z } from 'zod';

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(255),
    description: z.string().optional().nullable(),
    status: z.enum(['To Do', 'In Progress', 'Review', 'Done', 'Blocked']).default('To Do'),
    project_id: z.string().uuid().optional().nullable(),
    assigned_to: z.string().uuid().optional().nullable(),
    due_date: z.string().datetime().or(z.string().date()).optional().nullable(),
    priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).default('Medium'),
    type: z.string().default('Administrative'),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().optional().nullable(),
    status: z.enum(['To Do', 'In Progress', 'Review', 'Done', 'Blocked']).optional(),
    project_id: z.string().uuid().optional().nullable(),
    assigned_to: z.string().uuid().optional().nullable(),
    due_date: z.string().datetime().or(z.string().date()).optional().nullable(),
    priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).optional(),
    type: z.string().optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const getTaskSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const listTasksSchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    search: z.string().optional(),
    status: z.enum(['To Do', 'In Progress', 'Review', 'Done', 'Blocked']).optional(),
    priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).optional(),
    project_id: z.string().uuid().optional(),
    assigned_to: z.string().uuid().optional(),
    sortBy: z.string().optional().default('created_at'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>['body'];
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>['body'];
