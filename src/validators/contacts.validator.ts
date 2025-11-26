import { z } from 'zod';

export const createContactSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(255),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional().nullable(),
    company: z.string().optional().nullable(),
    role: z.enum(['Client', 'Vendor', 'Freelancer', 'Partner']).default('Client'),
    status: z.enum(['Active', 'Inactive', 'Pending']).default('Active'),
    notes: z.string().optional().nullable(),
    tags: z.array(z.string()).default([]),
  }),
});

export const updateContactSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional().nullable(),
    company: z.string().optional().nullable(),
    role: z.enum(['Client', 'Vendor', 'Freelancer', 'Partner']).optional(),
    status: z.enum(['Active', 'Inactive', 'Pending']).optional(),
    notes: z.string().optional().nullable(),
    tags: z.array(z.string()).optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const getContactSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const listContactsSchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    search: z.string().optional(),
    role: z.enum(['Client', 'Vendor', 'Freelancer', 'Partner']).optional(),
    status: z.enum(['Active', 'Inactive', 'Pending']).optional(),
    sortBy: z.string().optional().default('created_at'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export type CreateContactInput = z.infer<typeof createContactSchema>['body'];
export type UpdateContactInput = z.infer<typeof updateContactSchema>['body'];
