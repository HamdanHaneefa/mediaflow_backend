import { createObjectCsvWriter } from 'csv-writer';
import * as fs from 'fs';
import * as path from 'path';

export interface CSVExportOptions {
  filename: string;
  headers: { id: string; title: string }[];
  data: any[];
  path?: string;
}

export class CSVExporter {
  private outputDir: string;

  constructor(outputDir: string = 'exports/csv') {
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
   * Export data to CSV file
   */
  async export(options: CSVExportOptions): Promise<string> {
    const timestamp = new Date().getTime();
    const filename = `${options.filename}_${timestamp}.csv`;
    const filePath = path.join(process.cwd(), this.outputDir, filename);

    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: options.headers,
    });

    await csvWriter.writeRecords(options.data);

    return filePath;
  }

  /**
   * Export income data to CSV
   */
  async exportIncome(data: any[]): Promise<string> {
    return this.export({
      filename: 'income',
      headers: [
        { id: 'id', title: 'ID' },
        { id: 'date', title: 'Date' },
        { id: 'amount', title: 'Amount' },
        { id: 'source', title: 'Source' },
        { id: 'description', title: 'Description' },
        { id: 'clientName', title: 'Client' },
        { id: 'projectTitle', title: 'Project' },
        { id: 'invoiceNumber', title: 'Invoice Number' },
      ],
      data: data.map((item) => ({
        id: item.id,
        date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
        amount: item.amount,
        source: item.source || '',
        description: item.description || '',
        clientName: item.client?.name || '',
        projectTitle: item.project?.title || '',
        invoiceNumber: item.invoice?.invoice_number || '',
      })),
    });
  }

  /**
   * Export expenses data to CSV
   */
  async exportExpenses(data: any[]): Promise<string> {
    return this.export({
      filename: 'expenses',
      headers: [
        { id: 'id', title: 'ID' },
        { id: 'date', title: 'Date' },
        { id: 'amount', title: 'Amount' },
        { id: 'category', title: 'Category' },
        { id: 'description', title: 'Description' },
        { id: 'status', title: 'Status' },
        { id: 'projectTitle', title: 'Project' },
        { id: 'userName', title: 'Submitted By' },
      ],
      data: data.map((item) => ({
        id: item.id,
        date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
        amount: item.amount,
        category: item.category || '',
        description: item.description || '',
        status: item.status || '',
        projectTitle: item.project?.title || '',
        userName: item.user?.name || '',
      })),
    });
  }

  /**
   * Export invoices data to CSV
   */
  async exportInvoices(data: any[]): Promise<string> {
    return this.export({
      filename: 'invoices',
      headers: [
        { id: 'invoiceNumber', title: 'Invoice #' },
        { id: 'date', title: 'Date' },
        { id: 'dueDate', title: 'Due Date' },
        { id: 'clientName', title: 'Client' },
        { id: 'projectTitle', title: 'Project' },
        { id: 'subtotal', title: 'Subtotal' },
        { id: 'tax', title: 'Tax' },
        { id: 'total', title: 'Total' },
        { id: 'status', title: 'Status' },
      ],
      data: data.map((item) => ({
        invoiceNumber: item.invoice_number,
        date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
        dueDate: item.due_date ? new Date(item.due_date).toISOString().split('T')[0] : '',
        clientName: item.client?.name || '',
        projectTitle: item.project?.title || '',
        subtotal: item.subtotal,
        tax: item.tax,
        total: item.total,
        status: item.status,
      })),
    });
  }

  /**
   * Export projects data to CSV
   */
  async exportProjects(data: any[]): Promise<string> {
    return this.export({
      filename: 'projects',
      headers: [
        { id: 'id', title: 'ID' },
        { id: 'title', title: 'Title' },
        { id: 'clientName', title: 'Client' },
        { id: 'status', title: 'Status' },
        { id: 'budget', title: 'Budget' },
        { id: 'startDate', title: 'Start Date' },
        { id: 'deadline', title: 'Deadline' },
        { id: 'progress', title: 'Progress %' },
      ],
      data: data.map((item) => ({
        id: item.id,
        title: item.title,
        clientName: item.client?.name || '',
        status: item.status,
        budget: item.budget || 0,
        startDate: item.start_date ? new Date(item.start_date).toISOString().split('T')[0] : '',
        deadline: item.deadline ? new Date(item.deadline).toISOString().split('T')[0] : '',
        progress: item.progress || 0,
      })),
    });
  }

  /**
   * Export proposals data to CSV
   */
  async exportProposals(data: any[]): Promise<string> {
    return this.export({
      filename: 'proposals',
      headers: [
        { id: 'proposalNumber', title: 'Proposal #' },
        { id: 'title', title: 'Title' },
        { id: 'clientName', title: 'Client' },
        { id: 'status', title: 'Status' },
        { id: 'totalAmount', title: 'Total Amount' },
        { id: 'validUntil', title: 'Valid Until' },
        { id: 'createdAt', title: 'Created' },
      ],
      data: data.map((item) => ({
        proposalNumber: item.proposal_number,
        title: item.title,
        clientName: item.lead?.company_name || '',
        status: item.status,
        totalAmount: item.total_amount,
        validUntil: item.valid_until ? new Date(item.valid_until).toISOString().split('T')[0] : '',
        createdAt: item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : '',
      })),
    });
  }

  /**
   * Export contacts data to CSV
   */
  async exportContacts(data: any[]): Promise<string> {
    return this.export({
      filename: 'contacts',
      headers: [
        { id: 'id', title: 'ID' },
        { id: 'name', title: 'Name' },
        { id: 'email', title: 'Email' },
        { id: 'phone', title: 'Phone' },
        { id: 'company', title: 'Company' },
        { id: 'position', title: 'Position' },
        { id: 'type', title: 'Type' },
        { id: 'status', title: 'Status' },
      ],
      data: data.map((item) => ({
        id: item.id,
        name: item.name,
        email: item.email || '',
        phone: item.phone || '',
        company: item.company || '',
        position: item.position || '',
        type: item.type,
        status: item.status,
      })),
    });
  }

  /**
   * Export tasks data to CSV
   */
  async exportTasks(data: any[]): Promise<string> {
    return this.export({
      filename: 'tasks',
      headers: [
        { id: 'id', title: 'ID' },
        { id: 'title', title: 'Title' },
        { id: 'projectTitle', title: 'Project' },
        { id: 'assignedTo', title: 'Assigned To' },
        { id: 'status', title: 'Status' },
        { id: 'priority', title: 'Priority' },
        { id: 'dueDate', title: 'Due Date' },
      ],
      data: data.map((item) => ({
        id: item.id,
        title: item.title,
        projectTitle: item.project?.title || '',
        assignedTo: item.user?.name || '',
        status: item.status,
        priority: item.priority,
        dueDate: item.due_date ? new Date(item.due_date).toISOString().split('T')[0] : '',
      })),
    });
  }

  /**
   * Export leads data to CSV
   */
  async exportLeads(data: any[]): Promise<string> {
    return this.export({
      filename: 'leads',
      headers: [
        { id: 'id', title: 'ID' },
        { id: 'contactName', title: 'Contact Name' },
        { id: 'email', title: 'Email' },
        { id: 'companyName', title: 'Company' },
        { id: 'status', title: 'Status' },
        { id: 'source', title: 'Source' },
        { id: 'estimatedValue', title: 'Estimated Value' },
        { id: 'assignedTo', title: 'Assigned To' },
      ],
      data: data.map((item) => ({
        id: item.id,
        contactName: item.contact_name,
        email: item.email || '',
        companyName: item.company_name || '',
        status: item.status,
        source: item.source || '',
        estimatedValue: item.estimated_value || 0,
        assignedTo: item.user?.name || '',
      })),
    });
  }

  /**
   * Export team members data to CSV
   */
  async exportTeamMembers(data: any[]): Promise<string> {
    return this.export({
      filename: 'team_members',
      headers: [
        { id: 'id', title: 'ID' },
        { id: 'name', title: 'Name' },
        { id: 'email', title: 'Email' },
        { id: 'role', title: 'Role' },
        { id: 'phone', title: 'Phone' },
        { id: 'status', title: 'Status' },
        { id: 'createdAt', title: 'Joined Date' },
      ],
      data: data.map((item) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        role: item.role,
        phone: item.phone || '',
        status: item.is_active ? 'Active' : 'Inactive',
        createdAt: item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : '',
      })),
    });
  }
}
