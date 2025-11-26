import { PrismaClient } from '@prisma/client';
import { parseDateRange } from '../utils/date-helpers';
import { CSVExporter } from '../utils/csv-export';
import { ExcelExporter } from '../utils/excel-export';
import cacheService, { CACHE_KEYS, CACHE_TTL } from './cache.service';

const prisma = new PrismaClient();

export class ExportsService {
  private csvExporter: CSVExporter;
  private excelExporter: ExcelExporter;

  constructor() {
    this.csvExporter = new CSVExporter();
    this.excelExporter = new ExcelExporter();
  }

  /**
   * Export data to CSV format
   */
  async exportToCSV(
    dataSource: string,
    startDate?: string,
    endDate?: string,
    filters?: any
  ): Promise<string> {
    const data = await this.fetchData(dataSource, startDate, endDate, filters);

    switch (dataSource) {
      case 'income':
        return this.csvExporter.exportIncome(data);
      case 'expenses':
        return this.csvExporter.exportExpenses(data);
      case 'invoices':
        return this.csvExporter.exportInvoices(data);
      case 'projects':
        return this.csvExporter.exportProjects(data);
      case 'proposals':
        return this.csvExporter.exportProposals(data);
      case 'contacts':
        return this.csvExporter.exportContacts(data);
      case 'tasks':
        return this.csvExporter.exportTasks(data);
      case 'leads':
        return this.csvExporter.exportLeads(data);
      case 'team_members':
        return this.csvExporter.exportTeamMembers(data);
      default:
        throw new Error(`Unsupported data source: ${dataSource}`);
    }
  }

  /**
   * Export data to Excel format
   */
  async exportToExcel(
    reportType: string,
    startDate?: string,
    endDate?: string,
    filters?: any
  ): Promise<string> {
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

    switch (reportType) {
      case 'financial':
        return this.exportFinancialReport(dateFilter, filters);
      case 'projects':
        return this.exportProjectReport(dateFilter, filters);
      case 'analytics':
        return this.exportAnalyticsReport(startDate!, endDate!, filters);
      case 'crm':
        return this.exportCRMReport(dateFilter, filters);
      default:
        throw new Error(`Unsupported report type: ${reportType}`);
    }
  }

  /**
   * Batch export multiple data sources
   */
  async batchExport(
    dataSources: string[],
    format: 'csv' | 'excel',
    startDate?: string,
    endDate?: string
  ): Promise<string[]> {
    const exportPromises = dataSources.map((source) => {
      if (format === 'csv') {
        return this.exportToCSV(source, startDate, endDate);
      } else {
        return this.exportToExcel(source, startDate, endDate);
      }
    });

    return Promise.all(exportPromises);
  }

  // Private helper methods

  private async fetchData(
    dataSource: string,
    startDate?: string,
    endDate?: string,
    filters?: any
  ): Promise<any[]> {
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

    switch (dataSource) {
      case 'income':
        return prisma.income.findMany({
          where: { ...dateFilter, ...filters },
          include: {
            client: { select: { name: true } },
            project: { select: { title: true } },
            invoice: { select: { invoice_number: true } },
          },
          orderBy: { date: 'desc' },
        });

      case 'expenses':
        return prisma.expenses.findMany({
          where: { ...dateFilter, ...filters },
          include: {
            project: { select: { title: true } },
            user: { select: { name: true } },
          },
          orderBy: { date: 'desc' },
        });

      case 'invoices':
        return prisma.invoices.findMany({
          where: {
            ...(startDate && endDate
              ? {
                  created_at: {
                    gte: parseDateRange(startDate, endDate).startDate,
                    lte: parseDateRange(startDate, endDate).endDate,
                  },
                }
              : {}),
            ...filters,
          },
          include: {
            client: { select: { name: true } },
            project: { select: { title: true } },
          },
          orderBy: { created_at: 'desc' },
        });

      case 'projects':
        return prisma.projects.findMany({
          where: {
            ...(startDate && endDate
              ? {
                  created_at: {
                    gte: parseDateRange(startDate, endDate).startDate,
                    lte: parseDateRange(startDate, endDate).endDate,
                  },
                }
              : {}),
            ...filters,
          },
          include: {
            client: { select: { name: true } },
          },
          orderBy: { created_at: 'desc' },
        });

      case 'proposals':
        return prisma.proposals.findMany({
          where: {
            ...(startDate && endDate
              ? {
                  created_at: {
                    gte: parseDateRange(startDate, endDate).startDate,
                    lte: parseDateRange(startDate, endDate).endDate,
                  },
                }
              : {}),
            ...filters,
          },
          include: {
            lead: { select: { company_name: true } },
          },
          orderBy: { created_at: 'desc' },
        });

      case 'contacts':
        return prisma.contacts.findMany({
          where: filters,
          orderBy: { created_at: 'desc' },
        });

      case 'tasks':
        return prisma.tasks.findMany({
          where: {
            ...(startDate && endDate
              ? {
                  created_at: {
                    gte: parseDateRange(startDate, endDate).startDate,
                    lte: parseDateRange(startDate, endDate).endDate,
                  },
                }
              : {}),
            ...filters,
          },
          include: {
            project: { select: { title: true } },
            user: { select: { name: true } },
          },
          orderBy: { created_at: 'desc' },
        });

      case 'leads':
        return prisma.leads.findMany({
          where: {
            ...(startDate && endDate
              ? {
                  created_at: {
                    gte: parseDateRange(startDate, endDate).startDate,
                    lte: parseDateRange(startDate, endDate).endDate,
                  },
                }
              : {}),
            ...filters,
          },
          include: {
            user: { select: { name: true } },
          },
          orderBy: { created_at: 'desc' },
        });

      case 'team_members':
        return prisma.users.findMany({
          where: { ...filters, role: { not: 'Client' } },
          orderBy: { created_at: 'desc' },
        });

      default:
        throw new Error(`Unsupported data source: ${dataSource}`);
    }
  }

  private async exportFinancialReport(dateFilter: any, filters?: any): Promise<string> {
    const [income, expenses, invoices] = await Promise.all([
      prisma.income.findMany({
        where: { ...dateFilter, ...filters },
        include: {
          client: { select: { name: true } },
          project: { select: { title: true } },
        },
        orderBy: { date: 'desc' },
      }),
      prisma.expenses.findMany({
        where: { ...dateFilter, ...filters },
        include: {
          project: { select: { title: true } },
          user: { select: { name: true } },
        },
        orderBy: { date: 'desc' },
      }),
      prisma.invoices.findMany({
        where: filters,
        include: {
          client: { select: { name: true } },
          project: { select: { title: true } },
        },
        orderBy: { created_at: 'desc' },
        take: 100,
      }),
    ]);

    return this.excelExporter.exportFinancialData(income, expenses, invoices);
  }

  private async exportProjectReport(dateFilter: any, filters?: any): Promise<string> {
    const [projects, tasks] = await Promise.all([
      prisma.projects.findMany({
        where: filters,
        include: {
          client: { select: { name: true } },
        },
        orderBy: { created_at: 'desc' },
      }),
      prisma.tasks.findMany({
        where: filters,
        include: {
          project: { select: { title: true } },
          user: { select: { name: true } },
        },
        orderBy: { created_at: 'desc' },
        take: 500,
      }),
    ]);

    return this.excelExporter.exportProjectData(projects, tasks);
  }

  private async exportAnalyticsReport(
    startDate: string,
    endDate: string,
    filters?: any
  ): Promise<string> {
    const dateRange = parseDateRange(startDate, endDate);

    // Get summary data
    const [incomeSum, expensesSum] = await Promise.all([
      prisma.income.aggregate({
        where: {
          date: {
            gte: dateRange.startDate,
            lte: dateRange.endDate,
          },
        },
        _sum: { amount: true },
      }),
      prisma.expenses.aggregate({
        where: {
          date: {
            gte: dateRange.startDate,
            lte: dateRange.endDate,
          },
          status: { in: ['Approved', 'Paid'] },
        },
        _sum: { amount: true },
      }),
    ]);

    const totalRevenue = Number(incomeSum._sum.amount || 0);
    const totalExpenses = Number(expensesSum._sum.amount || 0);
    const netProfit = totalRevenue - totalExpenses;

    // Get trends (simplified for export)
    const income = await prisma.income.findMany({
      where: {
        date: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
      },
      select: { date: true, amount: true },
      orderBy: { date: 'asc' },
    });

    const expenses = await prisma.expenses.findMany({
      where: {
        date: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
        status: { in: ['Approved', 'Paid'] },
      },
      select: { date: true, amount: true },
      orderBy: { date: 'asc' },
    });

    // Get project profitability
    const projects = await prisma.projects.findMany({
      include: {
        income: {
          where: {
            date: {
              gte: dateRange.startDate,
              lte: dateRange.endDate,
            },
          },
          select: { amount: true },
        },
        expenses: {
          where: {
            date: {
              gte: dateRange.startDate,
              lte: dateRange.endDate,
            },
            status: { in: ['Approved', 'Paid'] },
          },
          select: { amount: true },
        },
      },
      take: 20,
    });

    const profitability = projects.map((project) => {
      const revenue = project.income.reduce((sum, i) => sum + Number(i.amount), 0);
      const costs = project.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
      const profit = revenue - costs;

      return {
        title: project.title,
        revenue,
        expenses: costs,
        profit,
        margin: revenue > 0 ? (profit / revenue) * 100 : 0,
      };
    });

    // Group revenue and expenses by month
    const groupByMonth = (data: any[]) => {
      const grouped = new Map();
      data.forEach((item) => {
        const month = new Date(item.date).toISOString().substring(0, 7);
        const current = grouped.get(month) || 0;
        grouped.set(month, current + Number(item.amount));
      });
      return Array.from(grouped.entries()).map(([period, value]) => ({
        period,
        value,
      }));
    };

    return this.excelExporter.exportAnalyticsReport({
      summary: {
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
      },
      revenue: groupByMonth(income),
      expenses: groupByMonth(expenses),
      profitability,
    });
  }

  private async exportCRMReport(dateFilter: any, filters?: any): Promise<string> {
    const [contacts, leads, proposals] = await Promise.all([
      prisma.contacts.findMany({
        where: filters,
        orderBy: { created_at: 'desc' },
        take: 500,
      }),
      prisma.leads.findMany({
        where: filters,
        orderBy: { created_at: 'desc' },
        take: 500,
      }),
      prisma.proposals.findMany({
        where: filters,
        include: {
          lead: { select: { company_name: true } },
        },
        orderBy: { created_at: 'desc' },
        take: 500,
      }),
    ]);

    return this.excelExporter.exportCRMData(contacts, leads, proposals);
  }
}
