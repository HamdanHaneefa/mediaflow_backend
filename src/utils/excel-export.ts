import ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';

export interface ExcelExportOptions {
  filename: string;
  sheets: {
    name: string;
    columns: { header: string; key: string; width?: number }[];
    data: any[];
  }[];
}

export class ExcelExporter {
  private outputDir: string;

  constructor(outputDir: string = 'exports/excel') {
    this.outputDir = outputDir;
    this.ensureDirectory();
  }

  private ensureDirectory() {
    const fullPath = path.join(process.cwd(), this.outputDir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  }

  /**
   * Export data to Excel file with multiple sheets
   */
  async export(options: ExcelExportOptions): Promise<string> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'MediaFlow CRM';
    workbook.created = new Date();

    // Add sheets
    for (const sheetConfig of options.sheets) {
      const worksheet = workbook.addWorksheet(sheetConfig.name);

      // Set columns
      worksheet.columns = sheetConfig.columns;

      // Style header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F81BD' },
      };
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

      // Add data
      worksheet.addRows(sheetConfig.data);

      // Auto-fit columns
      worksheet.columns.forEach((column) => {
        if (!column.width) {
          let maxLength = 10;
          column.eachCell?.({ includeEmpty: false }, (cell) => {
            const length = cell.value ? cell.value.toString().length : 0;
            if (length > maxLength) {
              maxLength = length;
            }
          });
          column.width = Math.min(maxLength + 2, 50);
        }
      });
    }

    // Save file
    const timestamp = new Date().getTime();
    const filename = `${options.filename}_${timestamp}.xlsx`;
    const filePath = path.join(process.cwd(), this.outputDir, filename);

    await workbook.xlsx.writeFile(filePath);

    return filePath;
  }

  /**
   * Export financial data (Income, Expenses, Invoices)
   */
  async exportFinancialData(income: any[], expenses: any[], invoices: any[]): Promise<string> {
    return this.export({
      filename: 'financial_data',
      sheets: [
        {
          name: 'Income',
          columns: [
            { header: 'Date', key: 'date', width: 12 },
            { header: 'Amount', key: 'amount', width: 12 },
            { header: 'Source', key: 'source', width: 15 },
            { header: 'Client', key: 'clientName', width: 20 },
            { header: 'Project', key: 'projectTitle', width: 25 },
            { header: 'Description', key: 'description', width: 30 },
          ],
          data: income.map((item) => ({
            date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
            amount: Number(item.amount),
            source: item.source || '',
            clientName: item.client?.name || '',
            projectTitle: item.project?.title || '',
            description: item.description || '',
          })),
        },
        {
          name: 'Expenses',
          columns: [
            { header: 'Date', key: 'date', width: 12 },
            { header: 'Amount', key: 'amount', width: 12 },
            { header: 'Category', key: 'category', width: 15 },
            { header: 'Status', key: 'status', width: 12 },
            { header: 'Project', key: 'projectTitle', width: 25 },
            { header: 'Submitted By', key: 'userName', width: 20 },
            { header: 'Description', key: 'description', width: 30 },
          ],
          data: expenses.map((item) => ({
            date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
            amount: Number(item.amount),
            category: item.category || '',
            status: item.status || '',
            projectTitle: item.project?.title || '',
            userName: item.user?.name || '',
            description: item.description || '',
          })),
        },
        {
          name: 'Invoices',
          columns: [
            { header: 'Invoice #', key: 'invoiceNumber', width: 15 },
            { header: 'Date', key: 'date', width: 12 },
            { header: 'Due Date', key: 'dueDate', width: 12 },
            { header: 'Client', key: 'clientName', width: 20 },
            { header: 'Project', key: 'projectTitle', width: 25 },
            { header: 'Subtotal', key: 'subtotal', width: 12 },
            { header: 'Tax', key: 'tax', width: 10 },
            { header: 'Total', key: 'total', width: 12 },
            { header: 'Status', key: 'status', width: 12 },
          ],
          data: invoices.map((item) => ({
            invoiceNumber: item.invoice_number,
            date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
            dueDate: item.due_date ? new Date(item.due_date).toISOString().split('T')[0] : '',
            clientName: item.client?.name || '',
            projectTitle: item.project?.title || '',
            subtotal: Number(item.subtotal),
            tax: Number(item.tax),
            total: Number(item.total),
            status: item.status,
          })),
        },
      ],
    });
  }

  /**
   * Export project data with tasks
   */
  async exportProjectData(projects: any[], tasks: any[]): Promise<string> {
    return this.export({
      filename: 'project_data',
      sheets: [
        {
          name: 'Projects',
          columns: [
            { header: 'Title', key: 'title', width: 30 },
            { header: 'Client', key: 'clientName', width: 20 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Budget', key: 'budget', width: 12 },
            { header: 'Progress', key: 'progress', width: 10 },
            { header: 'Start Date', key: 'startDate', width: 12 },
            { header: 'Deadline', key: 'deadline', width: 12 },
          ],
          data: projects.map((item) => ({
            title: item.title,
            clientName: item.client?.name || '',
            status: item.status,
            budget: Number(item.budget || 0),
            progress: `${item.progress || 0}%`,
            startDate: item.start_date ? new Date(item.start_date).toISOString().split('T')[0] : '',
            deadline: item.deadline ? new Date(item.deadline).toISOString().split('T')[0] : '',
          })),
        },
        {
          name: 'Tasks',
          columns: [
            { header: 'Title', key: 'title', width: 30 },
            { header: 'Project', key: 'projectTitle', width: 25 },
            { header: 'Assigned To', key: 'assignedTo', width: 20 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Priority', key: 'priority', width: 12 },
            { header: 'Due Date', key: 'dueDate', width: 12 },
          ],
          data: tasks.map((item) => ({
            title: item.title,
            projectTitle: item.project?.title || '',
            assignedTo: item.user?.name || '',
            status: item.status,
            priority: item.priority,
            dueDate: item.due_date ? new Date(item.due_date).toISOString().split('T')[0] : '',
          })),
        },
      ],
    });
  }

  /**
   * Export analytics report
   */
  async exportAnalyticsReport(data: {
    summary: any;
    revenue: any[];
    expenses: any[];
    profitability: any[];
  }): Promise<string> {
    const summaryData = [
      { metric: 'Total Revenue', value: data.summary.totalRevenue || 0 },
      { metric: 'Total Expenses', value: data.summary.totalExpenses || 0 },
      { metric: 'Net Profit', value: data.summary.netProfit || 0 },
      { metric: 'Profit Margin', value: `${data.summary.profitMargin || 0}%` },
    ];

    return this.export({
      filename: 'analytics_report',
      sheets: [
        {
          name: 'Summary',
          columns: [
            { header: 'Metric', key: 'metric', width: 30 },
            { header: 'Value', key: 'value', width: 20 },
          ],
          data: summaryData,
        },
        {
          name: 'Revenue Trends',
          columns: [
            { header: 'Period', key: 'period', width: 15 },
            { header: 'Amount', key: 'value', width: 15 },
            { header: 'Growth %', key: 'growth', width: 12 },
          ],
          data: data.revenue,
        },
        {
          name: 'Expense Trends',
          columns: [
            { header: 'Period', key: 'period', width: 15 },
            { header: 'Amount', key: 'value', width: 15 },
          ],
          data: data.expenses,
        },
        {
          name: 'Project Profitability',
          columns: [
            { header: 'Project', key: 'title', width: 30 },
            { header: 'Revenue', key: 'revenue', width: 15 },
            { header: 'Expenses', key: 'expenses', width: 15 },
            { header: 'Profit', key: 'profit', width: 15 },
            { header: 'Margin %', key: 'margin', width: 12 },
          ],
          data: data.profitability,
        },
      ],
    });
  }

  /**
   * Export CRM data (Contacts, Leads, Proposals)
   */
  async exportCRMData(contacts: any[], leads: any[], proposals: any[]): Promise<string> {
    return this.export({
      filename: 'crm_data',
      sheets: [
        {
          name: 'Contacts',
          columns: [
            { header: 'Name', key: 'name', width: 25 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Phone', key: 'phone', width: 15 },
            { header: 'Company', key: 'company', width: 25 },
            { header: 'Type', key: 'type', width: 12 },
            { header: 'Status', key: 'status', width: 12 },
          ],
          data: contacts.map((item) => ({
            name: item.name,
            email: item.email || '',
            phone: item.phone || '',
            company: item.company || '',
            type: item.type,
            status: item.status,
          })),
        },
        {
          name: 'Leads',
          columns: [
            { header: 'Contact', key: 'contactName', width: 25 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Company', key: 'companyName', width: 25 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Source', key: 'source', width: 15 },
            { header: 'Value', key: 'estimatedValue', width: 12 },
          ],
          data: leads.map((item) => ({
            contactName: item.contact_name,
            email: item.email || '',
            companyName: item.company_name || '',
            status: item.status,
            source: item.source || '',
            estimatedValue: Number(item.estimated_value || 0),
          })),
        },
        {
          name: 'Proposals',
          columns: [
            { header: 'Proposal #', key: 'proposalNumber', width: 15 },
            { header: 'Title', key: 'title', width: 30 },
            { header: 'Client', key: 'clientName', width: 25 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Amount', key: 'totalAmount', width: 15 },
            { header: 'Valid Until', key: 'validUntil', width: 12 },
          ],
          data: proposals.map((item) => ({
            proposalNumber: item.proposal_number,
            title: item.title,
            clientName: item.lead?.company_name || '',
            status: item.status,
            totalAmount: Number(item.total_amount),
            validUntil: item.valid_until ? new Date(item.valid_until).toISOString().split('T')[0] : '',
          })),
        },
      ],
    });
  }
}
