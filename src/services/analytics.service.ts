import { PrismaClient } from '@prisma/client';
import {
  parseDateRange,
  getDateRangeFromPeriod,
  groupDatesByPeriod,
  calculatePercentageChange,
  calculateGrowthRate,
  getPreviousPeriodRange,
} from '../utils/date-helpers';
import cacheService, { CACHE_KEYS, CACHE_TTL } from './cache.service';

const prisma = new PrismaClient();

export class AnalyticsService {
  /**
   * Get revenue trends over time
   */
  async getRevenueTrends(startDate: string, endDate: string, groupBy: 'day' | 'week' | 'month' = 'day') {
    const cacheKey = CACHE_KEYS.REVENUE_TRENDS(startDate, endDate, groupBy);
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const dateRange = parseDateRange(startDate, endDate);

    const income = await prisma.income.findMany({
      where: {
        date: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
      },
      select: {
        date: true,
        amount: true,
      },
      orderBy: { date: 'asc' },
    });

    const grouped = groupDatesByPeriod(
      income.map((i) => ({ date: i.date, value: Number(i.amount) })),
      groupBy
    );

    // Calculate trends
    let previousTotal = 0;
    const trends = grouped.map((item) => {
      const growth = previousTotal > 0 ? calculateGrowthRate(previousTotal, item.value) : 0;
      previousTotal = item.value;
      return {
        ...item,
        growth,
      };
    });

    const result = {
      data: trends,
      summary: {
        total: income.reduce((sum, i) => sum + Number(i.amount), 0),
        count: income.length,
        average: income.length > 0 ? income.reduce((sum, i) => sum + Number(i.amount), 0) / income.length : 0,
      },
    };

    await cacheService.set(cacheKey, result, CACHE_TTL.TRENDS);
    return result;
  }

  /**
   * Get revenue by client with trends
   */
  async getRevenueByClient(startDate: string, endDate: string, limit: number = 10) {
    const cacheKey = CACHE_KEYS.REVENUE_BY_CLIENT(startDate, endDate, limit);
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const dateRange = parseDateRange(startDate, endDate);
    const previousRange = getPreviousPeriodRange(dateRange, 'custom');

    // Current period
    const currentRevenue = await prisma.income.groupBy({
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

    // Previous period for comparison
    const clientIds = currentRevenue.map((r) => r.client_id!);
    const previousRevenue = await prisma.income.groupBy({
      by: ['client_id'],
      where: {
        date: {
          gte: previousRange.startDate,
          lte: previousRange.endDate,
        },
        client_id: { in: clientIds },
      },
      _sum: { amount: true },
    });

    const previousMap = new Map(
      previousRevenue.map((r) => [r.client_id, Number(r._sum.amount || 0)])
    );

    // Fetch client details
    const clients = await prisma.contacts.findMany({
      where: { id: { in: clientIds } },
      select: { id: true, name: true, email: true },
    });

    const clientMap = new Map(clients.map((c) => [c.id, c]));

    const result = currentRevenue.map((r) => {
      const current = Number(r._sum.amount || 0);
      const previous = previousMap.get(r.client_id!) || 0;
      const client = clientMap.get(r.client_id!);

      return {
        clientId: r.client_id,
        clientName: client?.name || 'Unknown',
        clientEmail: client?.email || null,
        revenue: current,
        previousRevenue: previous,
        trend: calculatePercentageChange(current, previous),
        transactionCount: r._count,
      };
    });

    await cacheService.set(cacheKey, result, CACHE_TTL.SUMMARY);
    return result;
  }

  /**
   * Get revenue by project with profitability
   */
  async getRevenueByProject(startDate: string, endDate: string, limit: number = 10) {
    const cacheKey = CACHE_KEYS.REVENUE_BY_PROJECT(startDate, endDate, limit);
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const dateRange = parseDateRange(startDate, endDate);

    const revenue = await prisma.income.groupBy({
      by: ['project_id'],
      where: {
        date: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
        project_id: { not: null },
      },
      _sum: { amount: true },
      _count: true,
      orderBy: { _sum: { amount: 'desc' } },
      take: limit,
    });

    const projectIds = revenue.map((r) => r.project_id!);

    // Get expenses for these projects
    const expenses = await prisma.expenses.groupBy({
      by: ['project_id'],
      where: {
        project_id: { in: projectIds },
        date: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
        status: { in: ['Approved', 'Paid'] },
      },
      _sum: { amount: true },
    });

    const expenseMap = new Map(
      expenses.map((e) => [e.project_id, Number(e._sum.amount || 0)])
    );

    // Fetch project details
    const projects = await prisma.projects.findMany({
      where: { id: { in: projectIds } },
      select: {
        id: true,
        title: true,
        status: true,
        contacts: { select: { name: true } },
      },
    });

    const projectMap = new Map(projects.map((p) => [p.id, p]));

    const result = revenue.map((r) => {
      const rev = Number(r._sum.amount || 0);
      const exp = expenseMap.get(r.project_id!) || 0;
      const profit = rev - exp;
      const project = projectMap.get(r.project_id!);

      return {
        projectId: r.project_id,
        projectName: project?.title || 'Unknown',
        projectStatus: project?.status || 'Unknown',
        clientName: project?.client?.name || null,
        revenue: rev,
        expenses: exp,
        profit,
        margin: rev > 0 ? (profit / rev) * 100 : 0,
        transactionCount: r._count,
      };
    });

    await cacheService.set(cacheKey, result, CACHE_TTL.SUMMARY);
    return result;
  }

  /**
   * Get revenue forecast based on historical data
   */
  async getRevenueForecast(months: number = 3) {
    const cacheKey = CACHE_KEYS.REVENUE_FORECAST(months);
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    // Get last 12 months of data for forecasting
    const historicalMonths = 12;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - historicalMonths);

    const income = await prisma.income.findMany({
      where: {
        date: { gte: startDate },
      },
      select: { date: true, amount: true },
      orderBy: { date: 'asc' },
    });

    const grouped = groupDatesByPeriod(
      income.map((i) => ({ date: i.date, value: Number(i.amount) })),
      'month'
    );

    // Simple linear regression for forecasting
    const n = grouped.length;
    if (n < 3) {
      return {
        forecast: [],
        historical: grouped,
        confidence: 'low',
        message: 'Insufficient data for accurate forecasting',
      };
    }

    const sumX = grouped.reduce((sum, _, i) => sum + i, 0);
    const sumY = grouped.reduce((sum, item) => sum + item.value, 0);
    const sumXY = grouped.reduce((sum, item, i) => sum + i * item.value, 0);
    const sumX2 = grouped.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Generate forecast
    const forecast = [];
    for (let i = 0; i < months; i++) {
      const forecastDate = new Date();
      forecastDate.setMonth(forecastDate.getMonth() + i + 1);
      const x = n + i;
      const predictedValue = Math.max(0, slope * x + intercept);

      forecast.push({
        period: forecastDate.toISOString().substring(0, 7),
        value: Math.round(predictedValue),
        confidence: i < 3 ? 'high' : 'medium',
      });
    }

    const result = {
      forecast,
      historical: grouped,
      trend: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable',
      averageGrowth: slope,
    };

    await cacheService.set(cacheKey, result, CACHE_TTL.FORECAST);
    return result;
  }

  /**
   * Get expense trends over time
   */
  async getExpenseTrends(startDate: string, endDate: string, groupBy: 'day' | 'week' | 'month' = 'day') {
    const cacheKey = CACHE_KEYS.EXPENSE_TRENDS(startDate, endDate, groupBy);
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const dateRange = parseDateRange(startDate, endDate);

    const expenses = await prisma.expenses.findMany({
      where: {
        date: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
        status: { in: ['Approved', 'Paid'] },
      },
      select: {
        date: true,
        amount: true,
      },
      orderBy: { date: 'asc' },
    });

    const grouped = groupDatesByPeriod(
      expenses.map((e) => ({ date: e.date, value: Number(e.amount) })),
      groupBy
    );

    const result = {
      data: grouped,
      summary: {
        total: expenses.reduce((sum, e) => sum + Number(e.amount), 0),
        count: expenses.length,
        average: expenses.length > 0 ? expenses.reduce((sum, e) => sum + Number(e.amount), 0) / expenses.length : 0,
      },
    };

    await cacheService.set(cacheKey, result, CACHE_TTL.TRENDS);
    return result;
  }

  /**
   * Get expenses by category with trends
   */
  async getExpensesByCategory(startDate: string, endDate: string) {
    const cacheKey = CACHE_KEYS.EXPENSE_BY_CATEGORY(startDate, endDate);
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const dateRange = parseDateRange(startDate, endDate);
    const previousRange = getPreviousPeriodRange(dateRange, 'custom');

    const current = await prisma.expenses.groupBy({
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
    });

    const previous = await prisma.expenses.groupBy({
      by: ['category'],
      where: {
        date: {
          gte: previousRange.startDate,
          lte: previousRange.endDate,
        },
        status: { in: ['Approved', 'Paid'] },
      },
      _sum: { amount: true },
    });

    const previousMap = new Map(
      previous.map((p) => [p.category, Number(p._sum.amount || 0)])
    );

    const total = current.reduce((sum, c) => sum + Number(c._sum.amount || 0), 0);

    const result = current.map((c) => {
      const currentAmount = Number(c._sum.amount || 0);
      const previousAmount = previousMap.get(c.category) || 0;

      return {
        category: c.category,
        amount: currentAmount,
        previousAmount,
        trend: calculatePercentageChange(currentAmount, previousAmount),
        count: c._count,
        percentage: total > 0 ? (currentAmount / total) * 100 : 0,
      };
    });

    await cacheService.set(cacheKey, result, CACHE_TTL.SUMMARY);
    return result;
  }

  /**
   * Get expenses by project
   */
  async getExpensesByProject(startDate: string, endDate: string, limit: number = 10) {
    const cacheKey = CACHE_KEYS.EXPENSE_BY_PROJECT(startDate, endDate, limit);
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const dateRange = parseDateRange(startDate, endDate);

    const expenses = await prisma.expenses.groupBy({
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
      _count: true,
      orderBy: { _sum: { amount: 'desc' } },
      take: limit,
    });

    const projectIds = expenses.map((e) => e.project_id!);

    const projects = await prisma.projects.findMany({
      where: { id: { in: projectIds } },
      select: {
        id: true,
        title: true,
        status: true,
        budget: true,
      },
    });

    const projectMap = new Map(projects.map((p) => [p.id, p]));

    const result = expenses.map((e) => {
      const amount = Number(e._sum.amount || 0);
      const project = projectMap.get(e.project_id!);
      const budget = Number(project?.budget || 0);

      return {
        projectId: e.project_id,
        projectName: project?.title || 'Unknown',
        projectStatus: project?.status || 'Unknown',
        expenses: amount,
        budget,
        budgetUsed: budget > 0 ? (amount / budget) * 100 : 0,
        count: e._count,
      };
    });

    await cacheService.set(cacheKey, result, CACHE_TTL.SUMMARY);
    return result;
  }

  /**
   * Get project profitability analysis
   */
  async getProjectProfitability(startDate?: string, endDate?: string, limit: number = 20) {
    const cacheKey = CACHE_KEYS.PROJECT_PROFITABILITY(startDate, endDate, limit);
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    let dateFilter = {};
    if (startDate && endDate) {
      const dateRange = parseDateRange(startDate, endDate);
      dateFilter = {
        date: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
      };
    }

    const projects = await prisma.projects.findMany({
      include: {
        income: {
          where: dateFilter,
          select: { amount: true },
        },
        expenses: {
          where: {
            ...dateFilter,
            status: { in: ['Approved', 'Paid'] },
          },
          select: { amount: true },
        },
        client: {
          select: { name: true },
        },
      },
      take: limit,
    });

    const result = projects
      .map((project) => {
        const revenue = project.income.reduce((sum, i) => sum + Number(i.amount), 0);
        const expenses = project.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
        const profit = revenue - expenses;
        const budget = Number(project.budget || 0);

        return {
          id: project.id,
          title: project.title,
          clientName: project.client?.name || null,
          status: project.status,
          revenue,
          expenses,
          profit,
          margin: revenue > 0 ? (profit / revenue) * 100 : 0,
          budget,
          budgetUsed: budget > 0 ? (expenses / budget) * 100 : 0,
          roi: expenses > 0 ? (profit / expenses) * 100 : 0,
        };
      })
      .sort((a, b) => b.profit - a.profit);

    await cacheService.set(cacheKey, result, CACHE_TTL.SUMMARY);
    return result;
  }

  /**
   * Get project performance metrics
   */
  async getProjectPerformance(startDate?: string, endDate?: string) {
    const cacheKey = CACHE_KEYS.PROJECT_PERFORMANCE(startDate, endDate);
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    let dateFilter = {};
    if (startDate && endDate) {
      const dateRange = parseDateRange(startDate, endDate);
      dateFilter = {
        updated_at: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
      };
    }

    const projects = await prisma.projects.findMany({
      where: dateFilter,
      include: {
        tasks: true,
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    const result = projects.map((project) => {
      const totalTasks = project.tasks.length;
      const completedTasks = project.tasks.filter((t) => t.status === 'Completed').length;
      const onTimeTasks = project.tasks.filter((t) => {
        if (t.status !== 'Completed') return false;
        return t.due_date ? t.updated_at <= t.due_date : true;
      }).length;

      return {
        id: project.id,
        title: project.title,
        status: project.status,
        totalTasks,
        completedTasks,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        onTimeRate: completedTasks > 0 ? (onTimeTasks / completedTasks) * 100 : 0,
        startDate: project.start_date,
        deadline: project.deadline,
      };
    });

    await cacheService.set(cacheKey, result, CACHE_TTL.SUMMARY);
    return result;
  }

  /**
   * Get team performance metrics
   */
  async getTeamPerformance(startDate: string, endDate: string) {
    const cacheKey = CACHE_KEYS.TEAM_PERFORMANCE(startDate, endDate);
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const dateRange = parseDateRange(startDate, endDate);

    const teamMembers = await prisma.users.findMany({
      where: { role: { not: 'Client' } },
      include: {
        tasks: {
          where: {
            updated_at: {
              gte: dateRange.startDate,
              lte: dateRange.endDate,
            },
          },
        },
        projects: {
          where: {
            updated_at: {
              gte: dateRange.startDate,
              lte: dateRange.endDate,
            },
          },
        },
      },
    });

    const result = teamMembers.map((member) => {
      const totalTasks = member.tasks.length;
      const completedTasks = member.tasks.filter((t) => t.status === 'Completed').length;
      const onTimeTasks = member.tasks.filter((t) => {
        if (t.status !== 'Completed') return false;
        return t.due_date ? t.updated_at <= t.due_date : true;
      }).length;

      return {
        userId: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        totalTasks,
        completedTasks,
        pendingTasks: totalTasks - completedTasks,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        onTimeRate: completedTasks > 0 ? (onTimeTasks / completedTasks) * 100 : 0,
        projectCount: member.projects.length,
      };
    });

    await cacheService.set(cacheKey, result, CACHE_TTL.SUMMARY);
    return result;
  }

  /**
   * Get team utilization metrics
   */
  async getTeamUtilization(period: string = 'month') {
    const cacheKey = CACHE_KEYS.TEAM_UTILIZATION(period);
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const dateRange = getDateRangeFromPeriod(period);

    const teamMembers = await prisma.users.findMany({
      where: { role: { not: 'Client' } },
      include: {
        tasks: {
          where: {
            OR: [
              {
                created_at: {
                  gte: dateRange.startDate,
                  lte: dateRange.endDate,
                },
              },
              {
                status: { not: 'Completed' },
              },
            ],
          },
        },
        projects: {
          where: {
            status: { in: ['Planning', 'In Progress'] },
          },
        },
      },
    });

    const result = teamMembers.map((member) => {
      const activeTasks = member.tasks.filter((t) => t.status !== 'Completed').length;
      const completedTasks = member.tasks.filter((t) => t.status === 'Completed').length;
      const highPriorityTasks = member.tasks.filter(
        (t) => t.priority === 'High' && t.status !== 'Completed'
      ).length;

      // Calculate workload score (0-100)
      const workloadScore = Math.min(100, (activeTasks * 10) + (highPriorityTasks * 5));

      return {
        userId: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        activeTasks,
        completedTasks,
        highPriorityTasks,
        activeProjects: member.projects.length,
        workloadScore,
        utilization: workloadScore > 80 ? 'high' : workloadScore > 50 ? 'medium' : 'low',
      };
    });

    await cacheService.set(cacheKey, result, CACHE_TTL.SUMMARY);
    return result;
  }
}
