export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}

export const getPaginationParams = (query: any): PaginationParams => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const sortBy = query.sortBy || 'created_at';
  const sortOrder = (query.sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc';

  return { page, limit, sortBy, sortOrder };
};

export const getPaginationMeta = (
  page: number,
  limit: number,
  total: number
): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

export const getPrismaSkipTake = (page: number, limit: number) => {
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
};

/**
 * Generic pagination function for Prisma models
 * @param model - The Prisma model to paginate
 * @param params - Pagination parameters (page, limit)
 * @param options - Prisma query options (where, orderBy, include, select)
 * @returns Paginated result with items and pagination metadata
 */
export async function paginate<T>(
  model: any,
  params: { page?: number; limit?: number },
  options: any = {}
): Promise<PaginatedResult<T>> {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 10));
  const skip = (page - 1) * limit;

  // Execute count and find queries in parallel
  const [total, items] = await Promise.all([
    model.count({ where: options.where }),
    model.findMany({
      ...options,
      skip,
      take: limit,
    }),
  ]);

  const pagination = getPaginationMeta(page, limit, total);

  return {
    items,
    pagination,
  };
}
