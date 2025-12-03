// Common utility types for the application

export type AsyncFunction<T = any> = (...args: any[]) => Promise<T>;

export type RequestHandler = (req: any, res: any, next: any) => Promise<void> | void;

export type ErrorHandler = (error: any, req: any, res: any, next: any) => Promise<void> | void;

// Database query types
export type QueryFilter = Record<string, any>;
export type QueryOptions = {
  include?: Record<string, any>;
  select?: Record<string, any>;
  orderBy?: Record<string, any>;
  where?: QueryFilter;
  take?: number;
  skip?: number;
};

// Response helpers
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: any;
  stack?: string;
}
