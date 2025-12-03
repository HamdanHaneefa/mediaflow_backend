// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import { groupDatesByPeriod, parseDateRange } from '../utils/date-helpers';
import cacheService, { CACHE_KEYS, CACHE_TTL } from './cache.service';

const prisma = new PrismaClient();

export class ReportsService {
  /**
   * Generate Profit & Loss (P&L) Report
   */
  async generateProfitLossReport(
    startDate: string,
    endDate: string,
    groupBy: 'day' | 'week' | 'month' | 'quarter' = 'month'
  ) {
    const cacheKey = CACHE_KEYS.REPORT_PL(startDate, endDate, groupBy);
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const dateRange = parseDateRange(startDate, endDate);

    // Get all income
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
        source: true,
        description: true,
      },
      orderBy: { date: 'asc' },
    });

    // Get all expenses
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
        category: true,
        description: true,
      },
      orderBy: { date: 'asc' },
    });

    // Group income by period
    const groupedIncome = groupDatesByPeriod(
      income.map((i) => ({ date: i.date, value: Number(i.amount) })),
      groupBy
    );

    // Group expenses by period
    const groupedExpenses = groupDatesByPeriod(
      expenses.map((e) => ({ date: e.date, value: Number(e.amount) })),
      groupBy
    );

    // Combine periods
    const periods = new Set([
      ...groupedIncome.map((g) => g.period),
      ...groupedExpenses.map((g) => g.period),
    ]);

    const incomeMap = new Map(groupedIncome.map((g) => [g.period, g.value]));
    const expenseMap = new Map(groupedExpenses.map((g) => [g.period, g.value]));

    const periodData = Array.from(periods)
      .sort()
      .map((period) => {
        const revenue = incomeMap.get(period) || 0;
        const cost = expenseMap.get(period) || 0;
        const grossProfit = revenue - cost;
        const margin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

        return {
          period,
          revenue,
          expenses: cost,
          grossProfit,
          margin,
        };
      });

    // Income breakdown by source
    const incomeBySource = income.reduce((acc: any, item) => {
      const source = item.source || 'Other';
      if (!acc[source]) acc[source] = 0;
      acc[source] += Number(item.amount);
      return acc;
    }, {});

    // Expenses breakdown by category
    const expensesByCategory = expenses.reduce((acc: any, item) => {
      const category = item.category || 'Other';
      if (!acc[category]) acc[category] = 0;
      acc[category] += Number(item.amount);
      return acc;
    }, {});

    const totalRevenue = income.reduce((sum, i) => sum + Number(i.amount), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const netProfit = totalRevenue - totalExpenses;

    const result = {
      reportType: 'Profit & Loss',
      period: { start: startDate, end: endDate },
      groupBy,
      summary: {
        totalRevenue,
        totalExpenses,
        grossProfit: netProfit,
        netProfit,
        profitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
      },
      periodData,
      incomeBreakdown: Object.entries(incomeBySource).map(([source, amount]) => ({
        source,
        amount,
        percentage: totalRevenue > 0 ? (Number(amount) / totalRevenue) * 100 : 0,
      })),
      expenseBreakdown: Object.entries(expensesByCategory).map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? (Number(amount) / totalExpenses) * 100 : 0,
      })),
      generatedAt: new Date(),
    };

    await cacheService.set(cacheKey, result, CACHE_TTL.REPORTS);
    return result;
  }

  /**
   * Generate Cash Flow Report
   */
  async generateCashFlowReport(
    startDate: string,
    endDate: string,
    groupBy: 'day' | 'week' | 'month' = 'month'
  ) {
    const cacheKey = CACHE_KEYS.REPORT_CASHFLOW(startDate, endDate, groupBy);
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const dateRange = parseDateRange(startDate, endDate);

    // Operating Cash Flow (Income)
    const income = await prisma.income.findMany({
      where: {
        date: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
      },
      select: { date: true, amount: true, source: true },
      orderBy: { date: 'asc' },
    });

    // Operating Cash Flow (Expenses)
    const expenses = await prisma.expenses.findMany({
      where: {
        date: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
        status: 'Paid',
      },
      select: { date: true, amount: true, category: true },
      orderBy: { date: 'asc' },
    });

    // Group by period
    const groupedIncome = groupDatesByPeriod(
      income.map((i) => ({ date: i.date, value: Number(i.amount) })),
      groupBy
    );

    const groupedExpenses = groupDatesByPeriod(
      expenses.map((e) => ({ date: e.date, value: Number(e.amount) })),
      groupBy
    );

    // Combine periods
    const periods = new Set([
      ...groupedIncome.map((g) => g.period),
      ...groupedExpenses.map((g) => g.period),
    ]);

    const incomeMap = new Map(groupedIncome.map((g) => [g.period, g.value]));
    const expenseMap = new Map(groupedExpenses.map((g) => [g.period, g.value]));

    let runningBalance = 0;
    const periodData = Array.from(periods)
      .sort()
      .map((period) => {
        const cashIn = incomeMap.get(period) || 0;
        const cashOut = expenseMap.get(period) || 0;
        const netCashFlow = cashIn - cashOut;
        runningBalance += netCashFlow;

        return {
          period,
          cashIn,
          cashOut,
          netCashFlow,
          runningBalance,
        };
      });

    const totalCashIn = income.reduce((sum, i) => sum + Number(i.amount), 0);
    const totalCashOut = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    const result = {
      reportType: 'Cash Flow',
      period: { start: startDate, end: endDate },
      groupBy,
      summary: {
        totalCashIn,
        totalCashOut,
        netCashFlow: totalCashIn - totalCashOut,
        openingBalance: runningBalance - (totalCashIn - totalCashOut),
        closingBalance: runningBalance,
      },
      periodData,
      generatedAt: new Date(),
    };

    await cacheService.set(cacheKey, result, CACHE_TTL.REPORTS);
    return result;
  }

  /**
   * Generate Accounts Receivable Aging Report
   */
  async generateAccountsReceivableReport() {
    const cacheKey = CACHE_KEYS.REPORT_AR();
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const today = new Date();

    const invoices = await prisma.invoices.findMany({
      where: {
        status: { in: ['Sent', 'Viewed', 'Overdue'] },
      },
      include: {
        client: {
          select: { id: true, name: true, email: true },
        },
        project: {
          select: { id: true, title: true },
        },
      },
      orderBy: { due_date: 'asc' },
    });

    // Categorize by aging buckets
    const agingBuckets = {
      current: [] as any[],
      days30: [] as any[],
      days60: [] as any[],
      days90: [] as any[],
      days90Plus: [] as any[],
    };

    invoices.forEach((invoice) => {
      const dueDate = new Date(invoice.due_date);
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      const item = {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoice_number,
        clientName: invoice.client.name,
        projectTitle: invoice.project?.title,
        amount: Number(invoice.total),
        dueDate: invoice.due_date,
        daysOverdue: Math.max(0, daysOverdue),
        status: invoice.status,
      };

      if (daysOverdue <= 0) {
        agingBuckets.current.push(item);
      } else if (daysOverdue <= 30) {
        agingBuckets.days30.push(item);
      } else if (daysOverdue <= 60) {
        agingBuckets.days60.push(item);
      } else if (daysOverdue <= 90) {
        agingBuckets.days90.push(item);
      } else {
        agingBuckets.days90Plus.push(item);
      }
    });

    const calculateTotal = (items: any[]) => items.reduce((sum, i) => sum + i.amount, 0);

    const totalOutstanding = calculateTotal(invoices);

    const result = {
      reportType: 'Accounts Receivable Aging',
      generatedAt: new Date(),
      summary: {
        totalOutstanding,
        totalInvoices: invoices.length,
        current: {
          count: agingBuckets.current.length,
          amount: calculateTotal(agingBuckets.current),
          percentage: totalOutstanding > 0 ? (calculateTotal(agingBuckets.current) / totalOutstanding) * 100 : 0,
        },
        days1to30: {
          count: agingBuckets.days30.length,
          amount: calculateTotal(agingBuckets.days30),
          percentage: totalOutstanding > 0 ? (calculateTotal(agingBuckets.days30) / totalOutstanding) * 100 : 0,
        },
        days31to60: {
          count: agingBuckets.days60.length,
          amount: calculateTotal(agingBuckets.days60),
          percentage: totalOutstanding > 0 ? (calculateTotal(agingBuckets.days60) / totalOutstanding) * 100 : 0,
        },
        days61to90: {
          count: agingBuckets.days90.length,
          amount: calculateTotal(agingBuckets.days90),
          percentage: totalOutstanding > 0 ? (calculateTotal(agingBuckets.days90) / totalOutstanding) * 100 : 0,
        },
        over90Days: {
          count: agingBuckets.days90Plus.length,
          amount: calculateTotal(agingBuckets.days90Plus),
          percentage: totalOutstanding > 0 ? (calculateTotal(agingBuckets.days90Plus) / totalOutstanding) * 100 : 0,
        },
      },
      aging: {
        current: agingBuckets.current,
        days1to30: agingBuckets.days30,
        days31to60: agingBuckets.days60,
        days61to90: agingBuckets.days90,
        over90Days: agingBuckets.days90Plus,
      },
    };

    await cacheService.set(cacheKey, result, CACHE_TTL.REPORTS);
    return result;
  }

  /**
   * Generate Expense Report by Category
   */
  async generateExpenseReport(
    startDate: string,
    endDate: string,
    category?: string
  ) {
    const cacheKey = CACHE_KEYS.REPORT_EXPENSE(startDate, endDate, category);
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const dateRange = parseDateRange(startDate, endDate);

    const where: any = {
      date: {
        gte: dateRange.startDate,
        lte: dateRange.endDate,
      },
      status: { in: ['Approved', 'Paid'] },
    };

    if (category) {
      where.category = category;
    }

    const expenses = await prisma.expenses.findMany({
      where,
      include: {
        project: {
          select: { id: true, title: true },
        },
        user: {
          select: { id: true, name: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    // Group by category
    const byCategory = expenses.reduce((acc: any, expense) => {
      const cat = expense.category || 'Uncategorized';
      if (!acc[cat]) {
        acc[cat] = { count: 0, total: 0, items: [] };
      }
      acc[cat].count++;
      acc[cat].total += Number(expense.amount);
      acc[cat].items.push(expense);
      return acc;
    }, {});

    // Group by project
    const byProject = expenses.reduce((acc: any, expense) => {
      if (!expense.project_id) return acc;
      const projectId = expense.project_id;
      if (!acc[projectId]) {
        acc[projectId] = {
          projectId,
          projectTitle: expense.project?.title || 'Unknown',
          count: 0,
          total: 0,
        };
      }
      acc[projectId].count++;
      acc[projectId].total += Number(expense.amount);
      return acc;
    }, {});

    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    const result = {
      reportType: 'Expense Report',
      period: { start: startDate, end: endDate },
      category: category || 'All Categories',
      summary: {
        totalExpenses,
        totalTransactions: expenses.length,
        averageExpense: expenses.length > 0 ? totalExpenses / expenses.length : 0,
      },
      byCategory: Object.entries(byCategory).map(([cat, data]: [string, any]) => ({
        category: cat,
        count: data.count,
        total: data.total,
        average: data.total / data.count,
        percentage: totalExpenses > 0 ? (data.total / totalExpenses) * 100 : 0,
      })),
      byProject: Object.values(byProject),
      topExpenses: expenses
        .sort((a, b) => Number(b.amount) - Number(a.amount))
        .slice(0, 10)
        .map((e) => ({
          id: e.id,
          date: e.date,
          amount: Number(e.amount),
          category: e.category,
          description: e.description,
          projectTitle: e.project?.title,
          userName: e.user?.name,
        })),
      generatedAt: new Date(),
    };

    await cacheService.set(cacheKey, result, CACHE_TTL.REPORTS);
    return result;
  }

  /**
   * Generate Income Report by Source
   */
  async generateIncomeReport(
    startDate: string,
    endDate: string,
    source?: string
  ) {
    const cacheKey = CACHE_KEYS.REPORT_INCOME(startDate, endDate, source);
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const dateRange = parseDateRange(startDate, endDate);

    const where: any = {
      date: {
        gte: dateRange.startDate,
        lte: dateRange.endDate,
      },
    };

    if (source) {
      where.source = source;
    }

    const income = await prisma.income.findMany({
      where,
      include: {
        client: {
          select: { id: true, name: true },
        },
        project: {
          select: { id: true, title: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    // Group by source
    const bySource = income.reduce((acc: any, item) => {
      const src = item.source || 'Other';
      if (!acc[src]) {
        acc[src] = { count: 0, total: 0 };
      }
      acc[src].count++;
      acc[src].total += Number(item.amount);
      return acc;
    }, {});

    // Group by client
    const byClient = income.reduce((acc: any, item) => {
      if (!item.client_id) return acc;
      const clientId = item.client_id;
      if (!acc[clientId]) {
        acc[clientId] = {
          clientId,
          clientName: item.client?.name || 'Unknown',
          count: 0,
          total: 0,
        };
      }
      acc[clientId].count++;
      acc[clientId].total += Number(item.amount);
      return acc;
    }, {});

    const totalIncome = income.reduce((sum, i) => sum + Number(i.amount), 0);

    const result = {
      reportType: 'Income Report',
      period: { start: startDate, end: endDate },
      source: source || 'All Sources',
      summary: {
        totalIncome,
        totalTransactions: income.length,
        averageIncome: income.length > 0 ? totalIncome / income.length : 0,
      },
      bySource: Object.entries(bySource).map(([src, data]: [string, any]) => ({
        source: src,
        count: data.count,
        total: data.total,
        average: data.total / data.count,
        percentage: totalIncome > 0 ? (data.total / totalIncome) * 100 : 0,
      })),
      byClient: Object.values(byClient)
        .sort((a: any, b: any) => b.total - a.total)
        .slice(0, 10),
      topTransactions: income
        .sort((a, b) => Number(b.amount) - Number(a.amount))
        .slice(0, 10)
        .map((i) => ({
          id: i.id,
          date: i.date,
          amount: Number(i.amount),
          source: i.source,
          description: i.description,
          clientName: i.client?.name,
          projectTitle: i.project?.title,
        })),
      generatedAt: new Date(),
    };

    await cacheService.set(cacheKey, result, CACHE_TTL.REPORTS);
    return result;
  }

  /**
   * Generate Custom Report
   */
  async generateCustomReport(config: {
    startDate: string;
    endDate: string;
    metrics: string[];
    groupBy?: string;
    filters?: any;
  }) {
    const { startDate, endDate, metrics, groupBy, filters } = config;
    const dateRange = parseDateRange(startDate, endDate);

    const result: any = {
      reportType: 'Custom Report',
      period: { start: startDate, end: endDate },
      metrics: {},
      generatedAt: new Date(),
    };

    // Build dynamic queries based on requested metrics
    const queries: any[] = [];

    if (metrics.includes('revenue')) {
      queries.push(
        prisma.income
          .aggregate({
            where: {
              date: { gte: dateRange.startDate, lte: dateRange.endDate },
              ...filters,
            },
            _sum: { amount: true },
            _count: true,
          })
          .then((data) => {
            result.metrics.revenue = {
              total: Number(data._sum.amount || 0),
              count: data._count,
            };
          })
      );
    }

    if (metrics.includes('expenses')) {
      queries.push(
        prisma.expenses
          .aggregate({
            where: {
              date: { gte: dateRange.startDate, lte: dateRange.endDate },
              status: { in: ['Approved', 'Paid'] },
              ...filters,
            },
            _sum: { amount: true },
            _count: true,
          })
          .then((data) => {
            result.metrics.expenses = {
              total: Number(data._sum.amount || 0),
              count: data._count,
            };
          })
      );
    }

    if (metrics.includes('projects')) {
      queries.push(
        prisma.projects
          .count({
            where: {
              updated_at: { gte: dateRange.startDate, lte: dateRange.endDate },
              ...filters,
            },
          })
          .then((count) => {
            result.metrics.projects = { count };
          })
      );
    }

    if (metrics.includes('tasks')) {
      queries.push(
        prisma.tasks
          .count({
            where: {
              updated_at: { gte: dateRange.startDate, lte: dateRange.endDate },
              ...filters,
            },
          })
          .then((count) => {
            result.metrics.tasks = { count };
          })
      );
    }

    if (metrics.includes('invoices')) {
      queries.push(
        prisma.invoices
          .aggregate({
            where: {
              created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
              ...filters,
            },
            _sum: { total: true },
            _count: true,
          })
          .then((data) => {
            result.metrics.invoices = {
              total: Number(data._sum.total || 0),
              count: data._count,
            };
          })
      );
    }

    await Promise.all(queries);

    return result;
  }
}
