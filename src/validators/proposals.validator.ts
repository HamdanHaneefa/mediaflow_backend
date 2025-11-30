import { z } from 'zod';

// Lead validation schemas
export const createLeadSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(200),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    company: z.string().optional(),
    source: z.enum([
      'Website',
      'Referral',
      'Social Media',
      'Email Campaign',
      'Cold Call',
      'Event',
      'Partnership',
      'Other'
    ]).optional(),
    status: z.enum(['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Lost', 'Converted']).optional(),
    score: z.number().min(0).max(100).optional(),
    budget: z.number().positive().optional(),
    project_type: z.string().optional(),
    timeline: z.string().optional(),
    notes: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const updateLeadSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid lead ID'),
  }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    company: z.string().optional(),
    source: z.enum([
      'Website',
      'Referral',
      'Social Media',
      'Email Campaign',
      'Cold Call',
      'Event',
      'Partnership',
      'Other'
    ]).optional(),
    status: z.enum(['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Lost', 'Converted']).optional(),
    score: z.number().min(0).max(100).optional(),
    budget: z.number().positive().optional(),
    project_type: z.string().optional(),
    timeline: z.string().optional(),
    notes: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const convertLeadSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid lead ID'),
  }),
  body: z.object({
    create_project: z.boolean().optional(),
    project_title: z.string().optional(),
    project_budget: z.number().positive().optional(),
  }),
});

export const listLeadsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    search: z.string().optional(),
    status: z.string().optional(),
    source: z.string().optional(),
    min_score: z.string().regex(/^\d+$/).transform(Number).optional(),
    max_score: z.string().regex(/^\d+$/).transform(Number).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

// Proposal validation schemas
export const createProposalSchema = z.object({
  body: z.object({
    proposal_number: z.string().min(1, 'Proposal number is required').max(50),
    title: z.string().min(1, 'Title is required').max(200),
    client_id: z.string().uuid('Invalid client ID').optional(),
    lead_id: z.string().uuid('Invalid lead ID').optional(),
    status: z.enum(['Draft', 'Sent', 'Viewed', 'Accepted', 'Rejected', 'Expired']).optional(),
    valid_until: z.string().datetime(),
    subtotal: z.number().nonnegative('Subtotal must be non-negative'),
    tax_rate: z.number().min(0).max(100).optional(),
    tax_amount: z.number().nonnegative().optional(),
    discount: z.number().nonnegative().optional(),
    total: z.number().positive('Total must be positive'),
    introduction: z.string().optional(),
    scope_of_work: z.string().optional(),
    deliverables: z.string().optional(),
    timeline: z.string().optional(),
    terms: z.string().optional(),
    notes: z.string().optional(),
    items: z.array(z.object({
      title: z.string().min(1, 'Item title is required'),
      description: z.string().optional(),
      quantity: z.number().positive('Quantity must be positive'),
      unit_price: z.number().nonnegative('Unit price must be non-negative'),
      amount: z.number().nonnegative('Amount must be non-negative'),
    })).min(1, 'At least one item is required'),
  }),
});

export const updateProposalSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid proposal ID'),
  }),
  body: z.object({
    proposal_number: z.string().min(1).max(50).optional(),
    title: z.string().min(1).max(200).optional(),
    client_id: z.string().uuid().optional(),
    lead_id: z.string().uuid().optional(),
    status: z.enum(['Draft', 'Sent', 'Viewed', 'Accepted', 'Rejected', 'Expired']).optional(),
    valid_until: z.string().datetime().optional(),
    subtotal: z.number().nonnegative().optional(),
    tax_rate: z.number().min(0).max(100).optional(),
    tax_amount: z.number().nonnegative().optional(),
    discount: z.number().nonnegative().optional(),
    total: z.number().positive().optional(),
    introduction: z.string().optional(),
    scope_of_work: z.string().optional(),
    deliverables: z.string().optional(),
    timeline: z.string().optional(),
    terms: z.string().optional(),
    notes: z.string().optional(),
    items: z.array(z.object({
      id: z.string().uuid().optional(),
      title: z.string().min(1),
      description: z.string().optional(),
      quantity: z.number().positive(),
      unit_price: z.number().nonnegative(),
      amount: z.number().nonnegative(),
    })).optional(),
  }),
});

export const listProposalsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    search: z.string().optional(),
    status: z.enum(['Draft', 'Sent', 'Viewed', 'Accepted', 'Rejected', 'Expired']).optional(),
    client_id: z.string().uuid().optional(),
    lead_id: z.string().uuid().optional(),
    start_date: z.string().datetime().optional(),
    end_date: z.string().datetime().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export const updateProposalStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid proposal ID'),
  }),
  body: z.object({
    status: z.enum(['Draft', 'Sent', 'Viewed', 'Accepted', 'Rejected', 'Expired'], {
      required_error: 'Status is required',
    }),
  }),
});

export const sendProposalSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid proposal ID'),
  }),
  body: z.object({
    to: z.string().email('Invalid email address'),
    cc: z.array(z.string().email()).optional(),
    subject: z.string().optional(),
    message: z.string().optional(),
  }),
});

export const signProposalSchema = z.object({
  params: z.object({
    token: z.string().min(1, 'Token is required'),
  }),
  body: z.object({
    signature_data: z.string().min(1, 'Signature is required'),
    signer_name: z.string().min(1, 'Signer name is required'),
    signer_email: z.string().email('Invalid email address'),
    signer_title: z.string().optional(),
    ip_address: z.string().optional(),
  }),
});

export const trackProposalViewSchema = z.object({
  params: z.object({
    token: z.string().min(1, 'Token is required'),
  }),
  body: z.object({
    duration: z.number().nonnegative().optional(),
    page_views: z.number().positive().optional(),
  }),
});
