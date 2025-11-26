import { z } from 'zod';

// Base report query schema
const baseReportSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  format: z.enum(['json', 'pdf', 'csv']).default('json'),
});

// Profit & Loss report schema
export const profitLossReportSchema = baseReportSchema.extend({
  groupBy: z.enum(['month', 'quarter', 'year']).default('month'),
  includeDetails: z.string().optional().transform((val) => val === 'true'),
});

// Cash flow report schema
export const cashFlowReportSchema = baseReportSchema.extend({
  groupBy: z.enum(['day', 'week', 'month', 'quarter']).default('month'),
  showProjections: z.string().optional().transform((val) => val === 'true'),
});

// Accounts receivable report schema
export const accountsReceivableReportSchema = baseReportSchema.extend({
  clientId: z.string().uuid().optional(),
  status: z.enum(['Sent', 'Viewed', 'Overdue', 'Paid', 'Cancelled', 'All']).default('All'),
  agingPeriods: z.array(z.number()).optional().default([30, 60, 90]),
  sortBy: z.enum(['dueDate', 'amount', 'client']).default('dueDate'),
});

// Expense report schema
export const expenseReportSchema = baseReportSchema.extend({
  category: z.string().optional(),
  projectId: z.string().uuid().optional(),
  teamMemberId: z.string().uuid().optional(),
  status: z.enum(['Draft', 'Pending', 'Approved', 'Rejected', 'Paid', 'All']).default('All'),
  groupBy: z.enum(['category', 'project', 'member', 'date']).optional(),
  sortBy: z.enum(['date', 'amount', 'category']).default('date'),
});

// Income report schema
export const incomeReportSchema = baseReportSchema.extend({
  source: z.enum(['Invoice', 'Project', 'Retainer', 'Other', 'All']).default('All'),
  clientId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  groupBy: z.enum(['client', 'project', 'source', 'date']).optional(),
  sortBy: z.enum(['date', 'amount', 'source']).default('date'),
});

// Custom report schema
export const customReportSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  dataSource: z.enum([
    'income',
    'expenses',
    'invoices',
    'projects',
    'proposals',
    'contacts',
    'tasks'
  ]),
  filters: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    status: z.string().optional(),
    category: z.string().optional(),
    projectId: z.string().uuid().optional(),
    clientId: z.string().uuid().optional(),
  }).optional(),
  metrics: z.array(z.string()).min(1),
  groupBy: z.string().optional(),
  sortBy: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  limit: z.number().min(1).max(1000).optional(),
});

// Report schedule schema
export const reportScheduleSchema = z.object({
  reportType: z.enum([
    'profit-loss',
    'cash-flow',
    'accounts-receivable',
    'expense',
    'income',
    'custom'
  ]),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly']),
  format: z.enum(['pdf', 'csv', 'excel']),
  recipients: z.array(z.string().email()).min(1),
  startDate: z.string(),
  active: z.boolean().default(true),
  customReportId: z.string().uuid().optional(),
});

// Update report schedule schema
export const updateReportScheduleSchema = reportScheduleSchema.partial();
