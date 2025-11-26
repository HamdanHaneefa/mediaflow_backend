import { z } from 'zod';

// Date range schema
const dateRangeSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  period: z.enum(['today', 'week', 'month', 'quarter', 'year', 'all']).optional(),
});

// Dashboard query schema
export const dashboardQuerySchema = z.object({
  period: z.enum(['today', 'week', 'month', 'quarter', 'year']).default('month'),
});

// Revenue analytics schemas
export const revenueTrendsQuerySchema = dateRangeSchema.extend({
  groupBy: z.enum(['day', 'week', 'month', 'quarter', 'year']).default('month'),
  clientId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
});

export const revenueByClientQuerySchema = dateRangeSchema.extend({
  limit: z.string().optional().transform((val) => (val ? parseInt(val) : 10)),
  sortBy: z.enum(['revenue', 'count', 'name']).default('revenue'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const revenueByProjectQuerySchema = dateRangeSchema.extend({
  limit: z.string().optional().transform((val) => (val ? parseInt(val) : 10)),
  clientId: z.string().uuid().optional(),
  status: z.enum(['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled']).optional(),
  sortBy: z.enum(['revenue', 'profit', 'name']).default('revenue'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const revenueForecastQuerySchema = z.object({
  months: z.string().optional().transform((val) => (val ? parseInt(val) : 6)),
  includeProposals: z.string().optional().transform((val) => val === 'true'),
});

// Expense analytics schemas
export const expenseTrendsQuerySchema = dateRangeSchema.extend({
  groupBy: z.enum(['day', 'week', 'month', 'quarter', 'year']).default('month'),
  category: z.string().optional(),
  projectId: z.string().uuid().optional(),
  status: z.enum(['Draft', 'Pending', 'Approved', 'Rejected', 'Paid']).optional(),
});

export const expenseByCategoryQuerySchema = dateRangeSchema.extend({
  limit: z.string().optional().transform((val) => (val ? parseInt(val) : 10)),
  sortBy: z.enum(['amount', 'count', 'name']).default('amount'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const expenseByProjectQuerySchema = dateRangeSchema.extend({
  limit: z.string().optional().transform((val) => (val ? parseInt(val) : 10)),
  clientId: z.string().uuid().optional(),
  status: z.enum(['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled']).optional(),
  sortBy: z.enum(['expenses', 'count', 'name']).default('expenses'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

// Project analytics schemas
export const projectProfitabilityQuerySchema = dateRangeSchema.extend({
  clientId: z.string().uuid().optional(),
  status: z.enum(['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled']).optional(),
  limit: z.string().optional().transform((val) => (val ? parseInt(val) : 20)),
  sortBy: z.enum(['profit', 'revenue', 'margin', 'name']).default('profit'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const projectPerformanceQuerySchema = dateRangeSchema.extend({
  clientId: z.string().uuid().optional(),
  status: z.enum(['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled']).optional(),
  metrics: z.array(z.enum([
    'completion',
    'timeline',
    'budget',
    'tasks',
    'profitability'
  ])).optional(),
});

// Team analytics schemas
export const teamPerformanceQuerySchema = dateRangeSchema.extend({
  teamMemberId: z.string().uuid().optional(),
  role: z.string().optional(),
  metrics: z.array(z.enum([
    'tasks',
    'projects',
    'revenue',
    'utilization',
    'performance'
  ])).optional(),
});

export const teamUtilizationQuerySchema = dateRangeSchema.extend({
  teamMemberId: z.string().uuid().optional(),
  groupBy: z.enum(['day', 'week', 'month']).default('week'),
});

// Export query schema
export const analyticsExportQuerySchema = z.object({
  type: z.enum(['dashboard', 'revenue', 'expenses', 'projects', 'team', 'custom']),
  format: z.enum(['csv', 'json']).default('csv'),
  ...dateRangeSchema.shape,
});
