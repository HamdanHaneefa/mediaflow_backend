import { PrismaClient } from '@prisma/client';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { paginate, PaginationParams, PaginatedResult } from '../utils/pagination';

const prisma = new PrismaClient();

// Expense Service
export class ExpenseService {
  async create(data: any, createdBy: string) {
    const expense = await prisma.expenses.create({
      data: {
        ...data,
        date: data.date ? new Date(data.date) : new Date(),
        status: 'Pending',
        created_by: createdBy,
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
          },
        },
        creator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        approver: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    });

    return expense;
  }

  async list(params: PaginationParams & {
    status?: string;
    category?: string;
    project_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 10, search, sortBy = 'date', sortOrder = 'desc', status, category, project_id, start_date, end_date } = params;

    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Category filter
    if (category) {
      where.category = category;
    }

    // Project filter
    if (project_id) {
      where.project_id = project_id;
    }

    // Date range filter
    if (start_date || end_date) {
      where.date = {};
      if (start_date) {
        where.date.gte = new Date(start_date);
      }
      if (end_date) {
        where.date.lte = new Date(end_date);
      }
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const result = await paginate(
      prisma.expenses,
      {
        where,
        orderBy,
        include: {
          project: {
            select: {
              id: true,
              title: true,
            },
          },
          creator: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          approver: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
      },
      page,
      limit
    );

    return result;
  }

  async getById(id: string) {
    const expense = await prisma.expenses.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            client: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        approver: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    });

    if (!expense) {
      throw new NotFoundError('Expense not found');
    }

    return expense;
  }

  async update(id: string, data: any) {
    const expense = await this.getById(id);

    if (expense.status !== 'Pending') {
      throw new BadRequestError('Cannot update expense that has been approved or rejected');
    }

    const updated = await prisma.expenses.update({
      where: { id },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
          },
        },
        creator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    });

    return updated;
  }

  async approve(id: string, status: 'Approved' | 'Rejected', approverId: string, notes?: string) {
    const expense = await this.getById(id);

    if (expense.status !== 'Pending') {
      throw new BadRequestError(`Expense is already ${expense.status.toLowerCase()}`);
    }

    const updated = await prisma.expenses.update({
      where: { id },
      data: {
        status,
        approved_by: approverId,
        approved_at: new Date(),
        notes: notes || expense.notes,
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
          },
        },
        creator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        approver: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    });

    return updated;
  }

  async delete(id: string) {
    const expense = await this.getById(id);

    if (expense.status === 'Approved') {
      throw new BadRequestError('Cannot delete approved expense');
    }

    await prisma.expenses.delete({
      where: { id },
    });

    return { message: 'Expense deleted successfully' };
  }

  async getStats(filters?: {
    project_id?: string;
    start_date?: string;
    end_date?: string;
  }) {
    const where: any = {};

    if (filters?.project_id) {
      where.project_id = filters.project_id;
    }

    if (filters?.start_date || filters?.end_date) {
      where.date = {};
      if (filters.start_date) {
        where.date.gte = new Date(filters.start_date);
      }
      if (filters.end_date) {
        where.date.lte = new Date(filters.end_date);
      }
    }

    const [byStatus, byCategory, totals] = await Promise.all([
      prisma.expenses.groupBy({
        by: ['status'],
        where,
        _sum: { amount: true },
        _count: true,
      }),
      prisma.expenses.groupBy({
        by: ['category'],
        where: { ...where, status: 'Approved' },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.expenses.aggregate({
        where,
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    return {
      by_status: byStatus.map((item) => ({
        status: item.status,
        count: item._count,
        total: item._sum.amount || 0,
      })),
      by_category: byCategory.map((item) => ({
        category: item.category,
        count: item._count,
        total: item._sum.amount || 0,
      })),
      totals: {
        count: totals._count,
        total_amount: totals._sum.amount || 0,
      },
    };
  }
}

// Income Service
export class IncomeService {
  async create(data: any, createdBy: string) {
    const income = await prisma.income.create({
      data: {
        ...data,
        date: data.date ? new Date(data.date) : new Date(),
        created_by: createdBy,
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        invoice: {
          select: {
            id: true,
            invoice_number: true,
          },
        },
        creator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    });

    return income;
  }

  async list(params: PaginationParams & {
    category?: string;
    project_id?: string;
    client_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 10, search, sortBy = 'date', sortOrder = 'desc', category, project_id, client_id, start_date, end_date } = params;

    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { reference: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Category filter
    if (category) {
      where.category = category;
    }

    // Project filter
    if (project_id) {
      where.project_id = project_id;
    }

    // Client filter
    if (client_id) {
      where.client_id = client_id;
    }

    // Date range filter
    if (start_date || end_date) {
      where.date = {};
      if (start_date) {
        where.date.gte = new Date(start_date);
      }
      if (end_date) {
        where.date.lte = new Date(end_date);
      }
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const result = await paginate(
      prisma.income,
      {
        where,
        orderBy,
        include: {
          project: {
            select: {
              id: true,
              title: true,
            },
          },
          client: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          invoice: {
            select: {
              id: true,
              invoice_number: true,
            },
          },
          creator: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
      },
      page,
      limit
    );

    return result;
  }

  async getById(id: string) {
    const income = await prisma.income.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            title: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        invoice: {
          select: {
            id: true,
            invoice_number: true,
            status: true,
          },
        },
        creator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    });

    if (!income) {
      throw new NotFoundError('Income not found');
    }

    return income;
  }

  async update(id: string, data: any) {
    await this.getById(id);

    const updated = await prisma.income.update({
      where: { id },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        invoice: {
          select: {
            id: true,
            invoice_number: true,
          },
        },
      },
    });

    return updated;
  }

  async delete(id: string) {
    await this.getById(id);

    await prisma.income.delete({
      where: { id },
    });

    return { message: 'Income deleted successfully' };
  }

  async getStats(filters?: {
    project_id?: string;
    client_id?: string;
    start_date?: string;
    end_date?: string;
  }) {
    const where: any = {};

    if (filters?.project_id) {
      where.project_id = filters.project_id;
    }

    if (filters?.client_id) {
      where.client_id = filters.client_id;
    }

    if (filters?.start_date || filters?.end_date) {
      where.date = {};
      if (filters.start_date) {
        where.date.gte = new Date(filters.start_date);
      }
      if (filters.end_date) {
        where.date.lte = new Date(filters.end_date);
      }
    }

    const [byCategory, byPaymentMethod, totals] = await Promise.all([
      prisma.income.groupBy({
        by: ['category'],
        where,
        _sum: { amount: true },
        _count: true,
      }),
      prisma.income.groupBy({
        by: ['payment_method'],
        where,
        _sum: { amount: true },
        _count: true,
      }),
      prisma.income.aggregate({
        where,
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    return {
      by_category: byCategory.map((item) => ({
        category: item.category,
        count: item._count,
        total: item._sum.amount || 0,
      })),
      by_payment_method: byPaymentMethod.map((item) => ({
        payment_method: item.payment_method,
        count: item._count,
        total: item._sum.amount || 0,
      })),
      totals: {
        count: totals._count,
        total_amount: totals._sum.amount || 0,
      },
    };
  }
}

// Financial Reports Service
export class FinancialReportService {
  async getDashboard(filters?: {
    project_id?: string;
    start_date?: string;
    end_date?: string;
  }) {
    const where: any = {};
    const dateFilter: any = {};

    if (filters?.start_date || filters?.end_date) {
      if (filters.start_date) {
        dateFilter.gte = new Date(filters.start_date);
      }
      if (filters.end_date) {
        dateFilter.lte = new Date(filters.end_date);
      }
    }

    if (filters?.project_id) {
      where.project_id = filters.project_id;
    }

    const [expenseStats, incomeStats] = await Promise.all([
      new ExpenseService().getStats({
        ...filters,
      }),
      new IncomeService().getStats({
        ...filters,
      }),
    ]);

    const totalExpenses = expenseStats.by_status
      .filter((s) => s.status === 'Approved')
      .reduce((sum, s) => sum + s.total, 0);

    const totalIncome = incomeStats.totals.total_amount;
    const profit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (profit / totalIncome) * 100 : 0;

    return {
      summary: {
        total_income: totalIncome,
        total_expenses: totalExpenses,
        profit,
        profit_margin: profitMargin,
      },
      expenses: expenseStats,
      income: incomeStats,
    };
  }

  async getProfitLoss(filters: {
    start_date: string;
    end_date: string;
    project_id?: string;
    group_by?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  }) {
    const where: any = {
      date: {
        gte: new Date(filters.start_date),
        lte: new Date(filters.end_date),
      },
    };

    if (filters.project_id) {
      where.project_id = filters.project_id;
    }

    const [expenses, income] = await Promise.all([
      prisma.expenses.findMany({
        where: { ...where, status: 'Approved' },
        select: {
          date: true,
          amount: true,
          category: true,
        },
      }),
      prisma.income.findMany({
        where,
        select: {
          date: true,
          amount: true,
          category: true,
        },
      }),
    ]);

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
    const netProfit = totalIncome - totalExpenses;

    return {
      period: {
        start: filters.start_date,
        end: filters.end_date,
      },
      income: {
        total: totalIncome,
        by_category: this.groupByCategory(income),
        items: income,
      },
      expenses: {
        total: totalExpenses,
        by_category: this.groupByCategory(expenses),
        items: expenses,
      },
      profit: {
        net_profit: netProfit,
        profit_margin: totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0,
      },
    };
  }

  private groupByCategory(items: Array<{ category: string; amount: number }>) {
    const grouped: Record<string, { count: number; total: number }> = {};

    items.forEach((item) => {
      if (!grouped[item.category]) {
        grouped[item.category] = { count: 0, total: 0 };
      }
      grouped[item.category].count++;
      grouped[item.category].total += item.amount;
    });

    return Object.entries(grouped).map(([category, data]) => ({
      category,
      count: data.count,
      total: data.total,
    }));
  }
}
