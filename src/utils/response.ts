import { Response } from 'express';

interface SuccessResponse {
  success: true;
  data?: any;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

interface ErrorResponse {
  success: false;
  message: string;
  errors?: any;
  stack?: string;
}

export const sendSuccess = (
  res: Response,
  data?: any,
  message?: string,
  statusCode = 200,
  meta?: SuccessResponse['meta']
): Response => {
  const response: SuccessResponse = {
    success: true,
  };

  if (data !== undefined) {
    response.data = data;
  }

  if (message) {
    response.message = message;
  }

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  errors?: any
): Response => {
  const response: ErrorResponse = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  if (process.env.NODE_ENV === 'development' && errors?.stack) {
    response.stack = errors.stack;
  }

  return res.status(statusCode).json(response);
};

export const sendCreated = (res: Response, data?: any, message = 'Resource created successfully'): Response => {
  return sendSuccess(res, data, message, 201);
};

export const sendNoContent = (res: Response): Response => {
  return res.status(204).send();
};

// Alias for backward compatibility
export const successResponse = sendSuccess;
