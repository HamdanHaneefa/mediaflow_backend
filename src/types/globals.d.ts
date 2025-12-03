/* eslint-disable @typescript-eslint/no-explicit-any */
// Type fixes for MediaFlow CRM Backend

declare module '@prisma/client' {
  interface PrismaClient {
    // Add any missing method signatures
  }
}

// Global type augmentations
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      JWT_SECRET: string;
      JWT_REFRESH_SECRET: string;
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}

// Common service interfaces
export interface ServiceResponse<T = any> {
  data?: T;
  message?: string;
  success?: boolean;
  error?: string;
}

export interface CreateExpenseInput {
  title: string;
  description?: string;
  amount: number;
  category: string;
  expense_date?: Date | string;
  vendor?: string;
  project_id?: string;
  receipt_url?: string;
}

export interface CreateIncomeInput {
  title: string;
  description?: string;
  amount: number;
  income_type: string;
  expected_date?: Date | string;
  received_date?: Date | string;
  project_id?: string;
  client_id?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Export commonly used types
export type AsyncHandler<T = any> = (...args: any[]) => Promise<T>;
export type QueryParams = Record<string, any>;
export type FilterParams = Record<string, any>;

export { };

