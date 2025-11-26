import { z } from 'zod';

export const createProjectSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(255),
    description: z.string().optional().nullable(),
    type: z.string().default('Commercial'),
    status: z.enum(['Active', 'On Hold', 'Completed', 'Cancelled']).default('Active'),
    phase: z.enum(['Pre-production', 'Production', 'Post-production', 'Delivery']).default('Pre-production'),
    client_id: z.string().uuid().optional().nullable(),
    budget: z.number().positive().optional().nullable(),
    start_date: z.string().datetime().or(z.string().date()).optional().nullable(),
    end_date: z.string().datetime().or(z.string().date()).optional().nullable(),
    team_members: z.array(z.string().uuid()).default([]),
  }),
});

export const updateProjectSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().optional().nullable(),
    type: z.string().optional(),
    status: z.enum(['Active', 'On Hold', 'Completed', 'Cancelled']).optional(),
    phase: z.enum(['Pre-production', 'Production', 'Post-production', 'Delivery']).optional(),
    client_id: z.string().uuid().optional().nullable(),
    budget: z.number().positive().optional().nullable(),
    start_date: z.string().datetime().or(z.string().date()).optional().nullable(),
    end_date: z.string().datetime().or(z.string().date()).optional().nullable(),
    team_members: z.array(z.string().uuid()).optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const getProjectSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const listProjectsSchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    search: z.string().optional(),
    status: z.enum(['Active', 'On Hold', 'Completed', 'Cancelled']).optional(),
    phase: z.enum(['Pre-production', 'Production', 'Post-production', 'Delivery']).optional(),
    client_id: z.string().uuid().optional(),
    sortBy: z.string().optional().default('created_at'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>['body'];
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>['body'];
