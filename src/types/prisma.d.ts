// Prisma-related type definitions

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// Common service response types
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Expense-related types
export interface CreateExpenseData {
  amount: number;
  category: string;
  description?: string;
  receipt_url?: string;
  project_id?: string;
  date?: Date | string;
}

export interface UpdateExpenseData extends Partial<CreateExpenseData> {
  status?: 'Pending' | 'Approved' | 'Rejected';
  approved_by?: string;
  approved_at?: Date;
  rejection_reason?: string;
}

// Income-related types
export interface CreateIncomeData {
  amount: number;
  source: string;
  description?: string;
  project_id?: string;
  date?: Date | string;
  category?: string;
}

export interface UpdateIncomeData extends Partial<CreateIncomeData> {
  status?: string;
}

// Project-related types
export interface CreateProjectData {
  title: string;
  description?: string;
  client_id: string;
  budget?: number;
  start_date?: Date | string;
  end_date?: Date | string;
  status?: string;
  priority?: string;
}

// Task-related types
export interface CreateTaskData {
  title: string;
  description?: string;
  project_id?: string;
  assigned_to?: string;
  due_date?: Date | string;
  priority?: string;
  status?: string;
}

// Analytics types
export interface RevenueData {
  date: Date;
  value: number;
}

export interface TrendData {
  period: string;
  value: number;
  growth?: number;
}

// Export types
export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  startDate?: string;
  endDate?: string;
  filters?: Record<string, any>;
}
