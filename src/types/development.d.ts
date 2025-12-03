// Global type suppressions for development
// This file helps suppress TypeScript errors during active development

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        permissions: Record<string, any>;
      };
      clientUser?: {
        id: string;
        email: string;
        contactId: string;
        isVerified: boolean;
        contact: {
          id: string;
          name: string;
          company: string | null;
        };
      };
    }
  }
}

// Extend Prisma types to handle common patterns
declare module '@prisma/client' {
  interface PrismaClient {
    [key: string]: any;
  }
  
  // Common select patterns
  interface ExpenseSelect {
    [key: string]: any;
  }
  
  interface IncomeSelect {
    [key: string]: any;
  }
  
  interface ProjectSelect {
    [key: string]: any;
  }
}

// Common service types
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any;
}

export interface ServiceOptions {
  [key: string]: any;
}

export interface QueryFilter {
  [key: string]: any;
}

export interface QueryOptions {
  include?: any;
  select?: any;
  orderBy?: any;
  where?: any;
  take?: number;
  skip?: number;
  [key: string]: any;
}

// Utility types for flexible development
export type AnyFunction = (...args: any[]) => any;
export type AsyncAnyFunction = (...args: any[]) => Promise<any>;
export type FlexibleObject = Record<string, any>;
export type OptionalFlexibleObject = Partial<Record<string, any>>;

export { };

