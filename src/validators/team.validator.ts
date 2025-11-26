import { z } from 'zod';

export const createTeamMemberSchema = z.object({
  body: z.object({
    first_name: z.string().min(1, 'First name is required').max(100),
    last_name: z.string().min(1, 'Last name is required').max(100),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional().nullable(),
    avatar_url: z.string().url().optional().nullable(),
    role: z.enum(['admin', 'manager', 'member', 'viewer']).default('member'),
    position: z.string().optional().nullable(),
    department: z.string().optional().nullable(),
    status: z.enum(['active', 'inactive', 'on_leave']).default('active'),
    permissions: z.record(z.boolean()).default({}),
    hourly_rate: z.number().positive().optional().nullable(),
    emergency_contact: z.record(z.any()).optional().nullable(),
    skills: z.array(z.string()).default([]),
    bio: z.string().optional().nullable(),
    hire_date: z.string().datetime().or(z.string().date()).optional().nullable(),
    team_id: z.string().uuid().optional().nullable(),
  }),
});

export const updateTeamMemberSchema = z.object({
  body: z.object({
    first_name: z.string().min(1).max(100).optional(),
    last_name: z.string().min(1).max(100).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional().nullable(),
    avatar_url: z.string().url().optional().nullable(),
    role: z.enum(['admin', 'manager', 'member', 'viewer']).optional(),
    position: z.string().optional().nullable(),
    department: z.string().optional().nullable(),
    status: z.enum(['active', 'inactive', 'on_leave']).optional(),
    permissions: z.record(z.boolean()).optional(),
    hourly_rate: z.number().positive().optional().nullable(),
    emergency_contact: z.record(z.any()).optional().nullable(),
    skills: z.array(z.string()).optional(),
    bio: z.string().optional().nullable(),
    team_id: z.string().uuid().optional().nullable(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const assignProjectSchema = z.object({
  body: z.object({
    project_id: z.string().uuid(),
    team_member_id: z.string().uuid(),
    role_in_project: z.string().min(1, 'Role is required'),
    is_lead: z.boolean().default(false),
    responsibilities: z.array(z.string()).default([]),
    hourly_rate_override: z.number().positive().optional().nullable(),
  }),
});

export const createTeamSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Team name is required').max(255),
    description: z.string().optional().nullable(),
    manager_id: z.string().uuid().optional().nullable(),
    member_ids: z.array(z.string().uuid()).default([]),
  }),
});

export const updateTeamSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().optional().nullable(),
    manager_id: z.string().uuid().optional().nullable(),
    member_ids: z.array(z.string().uuid()).optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const getTeamMemberSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const listTeamMembersSchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    search: z.string().optional(),
    role: z.enum(['admin', 'manager', 'member', 'viewer']).optional(),
    status: z.enum(['active', 'inactive', 'on_leave']).optional(),
    department: z.string().optional(),
    team_id: z.string().uuid().optional(),
    sortBy: z.string().optional().default('created_at'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export type CreateTeamMemberInput = z.infer<typeof createTeamMemberSchema>['body'];
export type UpdateTeamMemberInput = z.infer<typeof updateTeamMemberSchema>['body'];
export type AssignProjectInput = z.infer<typeof assignProjectSchema>['body'];
export type CreateTeamInput = z.infer<typeof createTeamSchema>['body'];
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>['body'];
