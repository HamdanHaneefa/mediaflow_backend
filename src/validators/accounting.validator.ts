import { z } from 'zod';

// Expense validation schemas
export const createExpenseSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().optional(),
    amount: z.number().positive('Amount must be positive'),
    category: z.enum([
      'Equipment',
      'Software',
      'Marketing',
      'Travel',
      'Catering',
      'Venue',
      'Talent',
      'Production',
      'Post-Production',
      'Office',
      'Other'
    ]),
    project_id: z.string().uuid().optional(),
    date: z.string().datetime().optional(),
    receipt_url: z.string().url().optional(),
    notes: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const updateExpenseSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid expense ID'),
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().optional(),
    amount: z.number().positive().optional(),
    category: z.enum([
      'Equipment',
      'Software',
      'Marketing',
      'Travel',
      'Catering',
      'Venue',
      'Talent',
      'Production',
      'Post-Production',
      'Office',
      'Other'
    ]).optional(),
    project_id: z.string().uuid().optional(),
    date: z.string().datetime().optional(),
    receipt_url: z.string().url().optional(),
    notes: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const approveExpenseSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid expense ID'),
  }),
  body: z.object({
    status: z.enum(['Approved', 'Rejected']),
    notes: z.string().optional(),
  }),
});

export const listExpensesSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    search: z.string().optional(),
    status: z.enum(['Pending', 'Approved', 'Rejected']).optional(),
    category: z.string().optional(),
    project_id: z.string().uuid().optional(),
    start_date: z.string().datetime().optional(),
    end_date: z.string().datetime().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

// Income validation schemas
export const createIncomeSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().optional(),
    amount: z.number().positive('Amount must be positive'),
    category: z.enum([
      'Project Payment',
      'Advance',
      'Final Payment',
      'Milestone',
      'Retainer',
      'Commission',
      'Royalty',
      'Other'
    ]),
    project_id: z.string().uuid().optional(),
    client_id: z.string().uuid().optional(),
    date: z.string().datetime().optional(),
    invoice_id: z.string().uuid().optional(),
    payment_method: z.enum(['Cash', 'Bank Transfer', 'Check', 'Credit Card', 'PayPal', 'Other']).optional(),
    reference: z.string().optional(),
    notes: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const updateIncomeSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid income ID'),
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().optional(),
    amount: z.number().positive().optional(),
    category: z.enum([
      'Project Payment',
      'Advance',
      'Final Payment',
      'Milestone',
      'Retainer',
      'Commission',
      'Royalty',
      'Other'
    ]).optional(),
    project_id: z.string().uuid().optional(),
    client_id: z.string().uuid().optional(),
    date: z.string().datetime().optional(),
    invoice_id: z.string().uuid().optional(),
    payment_method: z.enum(['Cash', 'Bank Transfer', 'Check', 'Credit Card', 'PayPal', 'Other']).optional(),
    reference: z.string().optional(),
    notes: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const listIncomesSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    search: z.string().optional(),
    category: z.string().optional(),
    project_id: z.string().uuid().optional(),
    client_id: z.string().uuid().optional(),
    start_date: z.string().datetime().optional(),
    end_date: z.string().datetime().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

// Invoice validation schemas
export const createInvoiceSchema = z.object({
  body: z.object({
    invoice_number: z.string().min(1, 'Invoice number is required').max(50),
    client_id: z.string().uuid('Invalid client ID'),
    project_id: z.string().uuid().optional(),
    issue_date: z.string().datetime(),
    due_date: z.string().datetime(),
    status: z.enum(['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled']).optional(),
    subtotal: z.number().nonnegative('Subtotal must be non-negative'),
    tax_rate: z.number().min(0).max(100).optional(),
    tax_amount: z.number().nonnegative().optional(),
    discount: z.number().nonnegative().optional(),
    total: z.number().positive('Total must be positive'),
    notes: z.string().optional(),
    terms: z.string().optional(),
    items: z.array(z.object({
      description: z.string().min(1, 'Item description is required'),
      quantity: z.number().positive('Quantity must be positive'),
      unit_price: z.number().nonnegative('Unit price must be non-negative'),
      amount: z.number().nonnegative('Amount must be non-negative'),
    })).min(1, 'At least one item is required'),
  }),
});

export const updateInvoiceSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid invoice ID'),
  }),
  body: z.object({
    invoice_number: z.string().min(1).max(50).optional(),
    client_id: z.string().uuid().optional(),
    project_id: z.string().uuid().optional(),
    issue_date: z.string().datetime().optional(),
    due_date: z.string().datetime().optional(),
    status: z.enum(['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled']).optional(),
    subtotal: z.number().nonnegative().optional(),
    tax_rate: z.number().min(0).max(100).optional(),
    tax_amount: z.number().nonnegative().optional(),
    discount: z.number().nonnegative().optional(),
    total: z.number().positive().optional(),
    notes: z.string().optional(),
    terms: z.string().optional(),
    items: z.array(z.object({
      id: z.string().uuid().optional(),
      description: z.string().min(1),
      quantity: z.number().positive(),
      unit_price: z.number().nonnegative(),
      amount: z.number().nonnegative(),
    })).optional(),
  }),
});

export const listInvoicesSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    search: z.string().optional(),
    status: z.enum(['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled']).optional(),
    client_id: z.string().uuid().optional(),
    project_id: z.string().uuid().optional(),
    start_date: z.string().datetime().optional(),
    end_date: z.string().datetime().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export const sendInvoiceSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid invoice ID'),
  }),
  body: z.object({
    to: z.string().email('Invalid email address'),
    cc: z.array(z.string().email()).optional(),
    subject: z.string().optional(),
    message: z.string().optional(),
  }),
});

// Financial reports validation
export const financialReportSchema = z.object({
  query: z.object({
    start_date: z.string().datetime('Start date is required'),
    end_date: z.string().datetime('End date is required'),
    project_id: z.string().uuid().optional(),
    group_by: z.enum(['day', 'week', 'month', 'quarter', 'year']).optional(),
  }),
});
