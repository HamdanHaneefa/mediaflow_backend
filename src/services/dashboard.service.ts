import { PrismaClient } from '@prisma/client';
import { parseDateRange, getDateRangeFromPeriod, calculatePercentageChange, getPreviousPeriodRange } from '../utils/date-helpers';
import cacheService, { CACHE_KEYS, CACHE_TTL } from './cache.service';

const prisma = new PrismaClient();

export class DashboardService {
  /**
   * Get overall dashboard metrics
   */
  async getDashboardMetrics(period: string = 'month') {
    // Try to get from cache
    const cacheKey = CACHE_KEYS.DASHBOARD(period);
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const dateRange = getDateRangeFromPeriod(period);
    const previousRange = getPreviousPeriodRange(dateRange, period);

    // Run all queries in parallel for better performance
    const [
      revenue,
      previousRevenue,
      expenses,
      previousExpenses,
      projects,
      tasks,
      invoices,
      proposals,
      leads,
    ] = await Promise.all([
      this.getRevenueMetrics(dateRange),
      this.getRevenueMetrics(previousRange),
      this.getExpenseMetrics(dateRange),
      this.getExpenseMetrics(previousRange),
      this.getProjectMetrics(dateRange),
      this.getTaskMetrics(dateRange),
      this.getInvoiceMetrics(dateRange),
      this.getProposalMetrics(dateRange),
      this.getLeadMetrics(dateRange),
    ]);

    const result = {
      period,
      dateRange: {
        start: dateRange.startDate,
        end: dateRange.endDate,
      },
      revenue: {
        current: revenue.total,
        previous: previousRevenue.total,
        trend: calculatePercentageChange(revenue.total, previousRevenue.total),
        count: revenue.count,
      },
      expenses: {
        current: expenses.total,
        previous: previousExpenses.total,
        trend: calculatePercentageChange(expenses.total, previousExpenses.total),
        count: expenses.count,
      },
      profit: {
        current: revenue.total - expenses.total,
        previous: previousRevenue.total - previousExpenses.total,
        margin: revenue.total > 0 ? ((revenue.total - expenses.total) / revenue.total) * 100 : 0,
      },
      projects,
      tasks,
      invoices,
      proposals,
      leads,
    };

    // Cache the result
    await cacheService.set(cacheKey, result, CACHE_TTL.DASHBOARD);

    return result;
  }

  /**
   * Get revenue dashboard data
   */
  async getRevenueDashboard(period: string = 'month') {
    const cacheKey = CACHE_KEYS.DASHBOARD_REVENUE(period);
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const dateRange = getDateRangeFromPeriod(period);
    const previousRange = getPreviousPeriodRange(dateRange, period);

    const [current, previous, byClient, byProject, bySource] = await Promise.all([
      this.getRevenueMetrics(dateRange),
      this.getRevenueMetrics(previousRange),
      this.getRevenueByClient(dateRange, 5),
      this.getRevenueByProject(dateRange, 5),
      this.getRevenueBySource(dateRange),
    ]);

    const result = {
      summary: {
        total: current.total,
        count: current.count,
        average: current.count > 0 ? current.total / current.count : 0,
        trend: calculatePercentageChange(current.total, previous.total),
      },
      topClients: byClient,
      topProjects: byProject,
      bySource,
    };

    await cacheService.set(cacheKey, result, CACHE_TTL.DASHBOARD);
    return result;
  }

  /**
   * Get expense dashboard data
   */
  async getExpenseDashboard(period: string = 'month') {
    const cacheKey = CACHE_KEYS.DASHBOARD_EXPENSES(period);
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const dateRange = getDateRangeFromPeriod(period);
    const previousRange = getPreviousPeriodRange(dateRange, period);

    const [current, previous, byCategory, byProject, pending] = await Promise.all([
      this.getExpenseMetrics(dateRange),
      this.getExpenseMetrics(previousRange),
      this.getExpensesByCategory(dateRange, 5),
      this.getExpensesByProject(dateRange, 5),
      this.getPendingExpenses(),
    ]);

    const result = {
      summary: {
        total: current.total,
        count: current.count,
        average: current.count > 0 ? current.total / current.count : 0,
        trend: calculatePercentageChange(current.total, previous.total),
        pending: pending.total,
        pendingCount: pending.count,
      },
      topCategories: byCategory,
      topProjects: byProject,
    };

    await cacheService.set(cacheKey, result, CACHE_TTL.DASHBOARD);
    return result;
  }

  /**
   * Get projects dashboard data
   */
  async getProjectsDashboard(period: string = 'month') {
    const cacheKey = CACHE_KEYS.DASHBOARD_PROJECTS(period);
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const dateRange = getDateRangeFromPeriod(period);

    const [metrics, byStatus, profitability] = await Promise.all([
      this.getProjectMetrics(dateRange),
      this.getProjectsByStatus(),
      this.getTopProfitableProjects(5),
    ]);

    const result = {
      ...metrics,
      byStatus,
      topProfitable: profitability,
    };

    await cacheService.set(cacheKey, result, CACHE_TTL.DASHBOARD);
    return result;
  }

  /**
   * Get tasks dashboard data
   */
  async getTasksDashboard(period: string = 'month') {
    const cacheKey = CACHE_KEYS.DASHBOARD_TASKS(period);
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const dateRange = getDateRangeFromPeriod(period);

    const [metrics, byStatus, byPriority, overdue] = await Promise.all([
      this.getTaskMetrics(dateRange),
      this.getTasksByStatus(),
      this.getTasksByPriority(),
      this.getOverdueTasks(),
    ]);

    const result = {
      ...metrics,
      byStatus,
      byPriority,
      overdue: {
        count: overdue.length,
        tasks: overdue.slice(0, 10), // Top 10 overdue
      },
    };

    await cacheService.set(cacheKey, result, CACHE_TTL.DASHBOARD);
    return result;
  }

  // Private helper methods

  private async getRevenueMetrics(dateRange: any) {
    const result = await prisma.income.aggregate({
      where: {
        date: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
      },
      _sum: { amount: true },
      _count: true,
    });

    return {
      total: Number(result._sum.amount || 0),
      count: result._count,
    };
  }

  private async getExpenseMetrics(dateRange: any) {
    const result = await prisma.expenses.aggregate({
      where: {
        date: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
        status: { in: ['Approved', 'Paid'] },
      },
      _sum: { amount: true },
      _count: true,
    });

    return {
      total: Number(result._sum.amount || 0),
      count: result._count,
    };
  }

  private async getProjectMetrics(dateRange: any) {
    const [active, completed, total] = await Promise.all([
      prisma.projects.count({
        where: { status: 'In Progress' },
      }),
      prisma.projects.count({
        where: {
          status: 'Completed',
          updated_at: {
            gte: dateRange.startDate,
            lte: dateRange.endDate,
          },
        },
      }),
      prisma.projects.count(),
    ]);

    return {
      active,
      completed,
      total,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
    };
  }

  private async getTaskMetrics(dateRange: any) {
    const [pending, completed, total] = await Promise.all([
      prisma.tasks.count({
        where: { status: { not: 'Completed' } },
      }),
      prisma.tasks.count({
        where: {
          status: 'Completed',
          updated_at: {
            gte: dateRange.startDate,
            lte: dateRange.endDate,
          },
        },
      }),
      prisma.tasks.count(),
    ]);

    return {
      pending,
      completed,
      total,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
    };
  }

  private async getInvoiceMetrics(dateRange: any) {
    const outstanding = await prisma.invoices.aggregate({
      where: {
        status: { in: ['Sent', 'Viewed'] },
      },
      _sum: { total: true },
      _count: true,
    });

    const overdue = await prisma.invoices.aggregate({
      where: {
        status: { in: ['Sent', 'Viewed'] },
        due_date: { lt: new Date() },
      },
      _sum: { total: true },
      _count: true,
    });

    return {
      outstanding: Number(outstanding._sum.total || 0),
      outstandingCount: outstanding._count,
      overdue: Number(overdue._sum.total || 0),
      overdueCount: overdue._count,
    };
  }

  private async getProposalMetrics(dateRange: any) {
    const [pending, accepted, total] = await Promise.all([
      prisma.proposals.count({
        where: { status: { in: ['Draft', 'Sent', 'Viewed'] } },
      }),
      prisma.proposals.count({
        where: {
          status: 'Accepted',
          updated_at: {
            gte: dateRange.startDate,
            lte: dateRange.endDate,
          },
        },
      }),
      prisma.proposals.count(),
    ]);

    return {
      pending,
      accepted,
      total,
      conversionRate: total > 0 ? (accepted / total) * 100 : 0,
    };
  }

  private async getLeadMetrics(dateRange: any) {
    const [newLeads, converted, total] = await Promise.all([
      prisma.leads.count({
        where: {
          created_at: {
            gte: dateRange.startDate,
            lte: dateRange.endDate,
          },
        },
      }),
      prisma.leads.count({
        where: {
          status: 'Won',
          updated_at: {
            gte: dateRange.startDate,
            lte: dateRange.endDate,
          },
        },
      }),
      prisma.leads.count(),
    ]);

    const pipelineValue = await prisma.leads.aggregate({
      where: { status: { not: { in: ['Won', 'Lost'] } } },
      _sum: { estimated_value: true },
    });

    return {
      new: newLeads,
      converted,
      total,
      conversionRate: newLeads > 0 ? (converted / newLeads) * 100 : 0,
      pipelineValue: Number(pipelineValue._sum.estimated_value || 0),
    };
  }

  private async getRevenueByClient(dateRange: any, limit: number) {
    const result = await prisma.income.groupBy({
      by: ['client_id'],
      where: {
        date: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
        client_id: { not: null },
      },
      _sum: { amount: true },
      _count: true,
      orderBy: { _sum: { amount: 'desc' } },
      take: limit,
    });

    // Fetch client details
    const clientIds = result.map((r) => r.client_id!);
    const clients = await prisma.contacts.findMany({
      where: { id: { in: clientIds } },
      select: { id: true, name: true },
    });

    const clientMap = new Map(clients.map((c) => [c.id, c.name]));

    return result.map((r) => ({
      clientId: r.client_id,
      clientName: clientMap.get(r.client_id!) || 'Unknown',
      revenue: Number(r._sum.amount || 0),
      count: r._count,
    }));
  }

  private async getRevenueByProject(dateRange: any, limit: number) {
    const result = await prisma.income.groupBy({
      by: ['project_id'],
      where: {
        date: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
        project_id: { not: null },
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: limit,
    });

    const projectIds = result.map((r) => r.project_id!);
    const projects = await prisma.projects.findMany({
      where: { id: { in: projectIds } },
      select: { id: true, title: true },
    });

    const projectMap = new Map(projects.map((p) => [p.id, p.title]));

    return result.map((r) => ({
      projectId: r.project_id,
      projectName: projectMap.get(r.project_id!) || 'Unknown',
      revenue: Number(r._sum.amount || 0),
    }));
  }

  private async getRevenueBySource(dateRange: any) {
    return await prisma.income.groupBy({
      by: ['source'],
      where: {
        date: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
      },
      _sum: { amount: true },
      _count: true,
      orderBy: { _sum: { amount: 'desc' } },
    });
  }

  private async getExpensesByCategory(dateRange: any, limit: number) {
    const result = await prisma.expenses.groupBy({
      by: ['category'],
      where: {
        date: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
        status: { in: ['Approved', 'Paid'] },
      },
      _sum: { amount: true },
      _count: true,
      orderBy: { _sum: { amount: 'desc' } },
      take: limit,
    });

    return result.map((r) => ({
      category: r.category,
      amount: Number(r._sum.amount || 0),
      count: r._count,
    }));
  }

  private async getExpensesByProject(dateRange: any, limit: number) {
    const result = await prisma.expenses.groupBy({
      by: ['project_id'],
      where: {
        date: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
        status: { in: ['Approved', 'Paid'] },
        project_id: { not: null },
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: limit,
    });

    const projectIds = result.map((r) => r.project_id!);
    const projects = await prisma.projects.findMany({
      where: { id: { in: projectIds } },
      select: { id: true, title: true },
    });

    const projectMap = new Map(projects.map((p) => [p.id, p.title]));

    return result.map((r) => ({
      projectId: r.project_id,
      projectName: projectMap.get(r.project_id!) || 'Unknown',
      expenses: Number(r._sum.amount || 0),
    }));
  }

  private async getPendingExpenses() {
    const result = await prisma.expenses.aggregate({
      where: { status: 'Pending' },
      _sum: { amount: true },
      _count: true,
    });

    return {
      total: Number(result._sum.amount || 0),
      count: result._count,
    };
  }

  private async getProjectsByStatus() {
    return await prisma.projects.groupBy({
      by: ['status'],
      _count: true,
    });
  }

  private async getTopProfitableProjects(limit: number) {
    // This is a complex query - we'll need to calculate revenue - expenses per project
    const projects = await prisma.projects.findMany({
      include: {
        income: {
          select: { amount: true },
        },
        expenses: {
          where: { status: { in: ['Approved', 'Paid'] } },
          select: { amount: true },
        },
      },
      take: 100, // Get top 100 to calculate profit
    });

    const profitability = projects.map((project) => {
      const revenue = project.income.reduce((sum, i) => sum + Number(i.amount), 0);
      const expenses = project.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
      const profit = revenue - expenses;

      return {
        id: project.id,
        title: project.title,
        revenue,
        expenses,
        profit,
        margin: revenue > 0 ? (profit / revenue) * 100 : 0,
      };
    });

    return profitability
      .sort((a, b) => b.profit - a.profit)
      .slice(0, limit);
  }

  private async getTasksByStatus() {
    return await prisma.tasks.groupBy({
      by: ['status'],
      _count: true,
    });
  }

  private async getTasksByPriority() {
    return await prisma.tasks.groupBy({
      by: ['priority'],
      _count: true,
    });
  }

  private async getOverdueTasks() {
    return await prisma.tasks.findMany({
      where: {
        due_date: { lt: new Date() },
        status: { not: 'Completed' },
      },
      select: {
        id: true,
        title: true,
        due_date: true,
        priority: true,
        project: {
          select: { title: true },
        },
      },
      orderBy: { due_date: 'asc' },
      take: 20,
    });
  }
}
