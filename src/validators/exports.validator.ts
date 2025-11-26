import { z } from 'zod';

// CSV export schema
export const csvExportSchema = z.object({
  dataSource: z.enum([
    'income',
    'expenses',
    'invoices',
    'projects',
    'proposals',
    'contacts',
    'tasks',
    'leads',
    'team_members'
  ]),
  filters: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    status: z.string().optional(),
    category: z.string().optional(),
    projectId: z.string().uuid().optional(),
    clientId: z.string().uuid().optional(),
  }).optional(),
  columns: z.array(z.string()).optional(),
  filename: z.string().optional(),
});

// PDF export schema
export const pdfExportSchema = z.object({
  reportType: z.enum([
    'profit-loss',
    'cash-flow',
    'accounts-receivable',
    'expense',
    'income',
    'custom',
    'dashboard'
  ]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  filters: z.object({
    clientId: z.string().uuid().optional(),
    projectId: z.string().uuid().optional(),
    status: z.string().optional(),
  }).optional(),
  includeCharts: z.boolean().default(true),
  includeSummary: z.boolean().default(true),
  filename: z.string().optional(),
});

// Excel export schema
export const excelExportSchema = z.object({
  dataSource: z.enum([
    'income',
    'expenses',
    'invoices',
    'projects',
    'proposals',
    'contacts',
    'tasks',
    'financial-summary'
  ]),
  filters: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    status: z.string().optional(),
    category: z.string().optional(),
    projectId: z.string().uuid().optional(),
    clientId: z.string().uuid().optional(),
  }).optional(),
  sheets: z.array(z.object({
    name: z.string(),
    data: z.string(),
    includeFormulas: z.boolean().default(false),
  })).optional(),
  includeCharts: z.boolean().default(false),
  filename: z.string().optional(),
});

// Batch export schema
export const batchExportSchema = z.object({
  exports: z.array(z.object({
    type: z.enum(['csv', 'pdf', 'excel']),
    dataSource: z.string(),
    filters: z.object({}).optional(),
  })).min(1).max(10),
  compress: z.boolean().default(true),
  filename: z.string().optional(),
});
