import { PrismaClient } from '@prisma/client';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { paginate, PaginationParams, PaginatedResult } from '../utils/pagination';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export class InvoiceService {
  async create(data: any, createdBy: string) {
    const { items, ...invoiceData } = data;

    // Verify client exists
    const client = await prisma.contacts.findUnique({
      where: { id: data.client_id },
    });

    if (!client) {
      throw new NotFoundError('Client not found');
    }

    // Verify project if provided
    if (data.project_id) {
      const project = await prisma.projects.findUnique({
        where: { id: data.project_id },
      });

      if (!project) {
        throw new NotFoundError('Project not found');
      }
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: InvoiceItem) => sum + item.amount, 0);
    const taxAmount = invoiceData.tax_rate ? (subtotal * invoiceData.tax_rate) / 100 : 0;
    const discount = invoiceData.discount || 0;
    const total = subtotal + taxAmount - discount;

    const invoice = await prisma.invoices.create({
      data: {
        invoice_number: invoiceData.invoice_number,
        client_id: invoiceData.client_id,
        project_id: invoiceData.project_id,
        issue_date: new Date(invoiceData.issue_date),
        due_date: new Date(invoiceData.due_date),
        status: invoiceData.status || 'Draft',
        subtotal,
        tax_rate: invoiceData.tax_rate || 0,
        tax_amount: taxAmount,
        discount,
        total,
        notes: invoiceData.notes,
        terms: invoiceData.terms,
        created_by: createdBy,
        items: {
          create: items.map((item: InvoiceItem) => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            amount: item.amount,
          })),
        },
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            company: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
          },
        },
        items: true,
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

    return invoice;
  }

  async list(params: PaginationParams & {
    status?: string;
    client_id?: string;
    project_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<PaginatedResult<any>> {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      sortBy = 'issue_date', 
      sortOrder = 'desc',
      status,
      client_id,
      project_id,
      start_date,
      end_date 
    } = params;

    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { invoice_number: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
        { client: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Client filter
    if (client_id) {
      where.client_id = client_id;
    }

    // Project filter
    if (project_id) {
      where.project_id = project_id;
    }

    // Date range filter
    if (start_date || end_date) {
      where.issue_date = {};
      if (start_date) {
        where.issue_date.gte = new Date(start_date);
      }
      if (end_date) {
        where.issue_date.lte = new Date(end_date);
      }
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const result = await paginate(
      prisma.invoices,
      { page, limit },
      {
        where,
        orderBy,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              company: true,
            },
          },
          project: {
            select: {
              id: true,
              title: true,
            },
          },
          items: true,
          _count: {
            select: {
              items: true,
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
    const invoice = await prisma.invoices.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            company: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
        items: {
          orderBy: {
            created_at: 'asc',
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

    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    return invoice;
  }

  async update(id: string, data: any) {
    const invoice = await this.getById(id);

    if (invoice.status === 'Paid') {
      throw new BadRequestError('Cannot update paid invoice');
    }

    const { items, ...updateData } = data;

    // Calculate new totals if items are provided
    let updates: any = { ...updateData };

    if (items) {
      const subtotal = items.reduce((sum: number, item: InvoiceItem) => sum + item.amount, 0);
      const taxAmount = (updateData.tax_rate !== undefined ? updateData.tax_rate : invoice.tax_rate) 
        ? (subtotal * ((updateData.tax_rate !== undefined ? updateData.tax_rate : invoice.tax_rate) / 100))
        : 0;
      const discount = updateData.discount !== undefined ? updateData.discount : invoice.discount;
      const total = subtotal + taxAmount - discount;

      updates = {
        ...updates,
        subtotal,
        tax_amount: taxAmount,
        total,
      };

      // Delete existing items and create new ones
      await prisma.invoice_items.deleteMany({
        where: { invoice_id: id },
      });
    }

    // Convert dates if provided
    if (updates.issue_date) {
      updates.issue_date = new Date(updates.issue_date);
    }
    if (updates.due_date) {
      updates.due_date = new Date(updates.due_date);
    }

    const updated = await prisma.invoices.update({
      where: { id },
      data: {
        ...updates,
        ...(items && {
          items: {
            create: items.map((item: InvoiceItem) => ({
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              amount: item.amount,
            })),
          },
        }),
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            company: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
          },
        },
        items: true,
      },
    });

    return updated;
  }

  async updateStatus(id: string, status: string) {
    const invoice = await this.getById(id);

    const updated = await prisma.invoices.update({
      where: { id },
      data: {
        status,
        ...(status === 'Paid' && {
          paid_at: new Date(),
        }),
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
          },
        },
        items: true,
      },
    });

    return updated;
  }

  async delete(id: string) {
    const invoice = await this.getById(id);

    if (invoice.status === 'Paid') {
      throw new BadRequestError('Cannot delete paid invoice');
    }

    // Delete invoice items first
    await prisma.invoice_items.deleteMany({
      where: { invoice_id: id },
    });

    await prisma.invoices.delete({
      where: { id },
    });

    return { message: 'Invoice deleted successfully' };
  }

  async generatePDF(id: string): Promise<string> {
    const invoice = await this.getById(id);

    // Generate HTML for the invoice
    const html = this.generateInvoiceHTML(invoice);

    // Create invoices directory if it doesn't exist
    const invoicesDir = path.join(process.cwd(), 'uploads', 'invoices');
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    const filename = `invoice-${invoice.invoice_number}-${Date.now()}.html`;
    const filepath = path.join(invoicesDir, filename);

    // For now, save as HTML (can be converted to PDF with Puppeteer later)
    fs.writeFileSync(filepath, html);

    return `/uploads/invoices/${filename}`;
  }

  private generateInvoiceHTML(invoice: any): string {
    const itemsHTML = invoice.items.map((item: any) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.description}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${item.unit_price.toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${item.amount.toFixed(2)}</td>
      </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice ${invoice.invoice_number}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 40px; color: #1f2937; }
    .invoice-container { max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .company-info { font-size: 24px; font-weight: bold; color: #7c3aed; }
    .invoice-title { font-size: 32px; font-weight: bold; color: #1f2937; }
    .invoice-details { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .section { background: #f9fafb; padding: 20px; border-radius: 8px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { background: #7c3aed; color: white; padding: 12px; text-align: left; }
    .totals { float: right; width: 300px; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .grand-total { font-size: 20px; font-weight: bold; border-top: 2px solid #7c3aed; margin-top: 10px; padding-top: 10px; }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div class="company-info">MediaFlow CRM</div>
      <div class="invoice-title">INVOICE</div>
    </div>
    
    <div class="invoice-details">
      <div class="section" style="width: 48%;">
        <h3>Bill To:</h3>
        <p><strong>${invoice.client.name}</strong></p>
        ${invoice.client.company ? `<p>${invoice.client.company}</p>` : ''}
        ${invoice.client.email ? `<p>${invoice.client.email}</p>` : ''}
        ${invoice.client.phone ? `<p>${invoice.client.phone}</p>` : ''}
        ${invoice.client.address ? `<p>${invoice.client.address}</p>` : ''}
      </div>
      
      <div class="section" style="width: 48%;">
        <p><strong>Invoice #:</strong> ${invoice.invoice_number}</p>
        <p><strong>Issue Date:</strong> ${new Date(invoice.issue_date).toLocaleDateString()}</p>
        <p><strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString()}</p>
        <p><strong>Status:</strong> <span style="color: ${invoice.status === 'Paid' ? '#10b981' : '#f59e0b'};">${invoice.status}</span></p>
        ${invoice.project ? `<p><strong>Project:</strong> ${invoice.project.title}</p>` : ''}
      </div>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: center;">Quantity</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHTML}
      </tbody>
    </table>
    
    <div class="totals">
      <div class="total-row">
        <span>Subtotal:</span>
        <span>$${invoice.subtotal.toFixed(2)}</span>
      </div>
      ${invoice.tax_rate > 0 ? `
      <div class="total-row">
        <span>Tax (${invoice.tax_rate}%):</span>
        <span>$${invoice.tax_amount.toFixed(2)}</span>
      </div>
      ` : ''}
      ${invoice.discount > 0 ? `
      <div class="total-row">
        <span>Discount:</span>
        <span>-$${invoice.discount.toFixed(2)}</span>
      </div>
      ` : ''}
      <div class="total-row grand-total">
        <span>Total:</span>
        <span>$${invoice.total.toFixed(2)}</span>
      </div>
    </div>
    
    <div style="clear: both; padding-top: 40px;">
      ${invoice.notes ? `
      <div class="section" style="margin-bottom: 20px;">
        <h4>Notes:</h4>
        <p>${invoice.notes}</p>
      </div>
      ` : ''}
      
      ${invoice.terms ? `
      <div class="section">
        <h4>Terms & Conditions:</h4>
        <p>${invoice.terms}</p>
      </div>
      ` : ''}
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  async getStats(filters?: {
    client_id?: string;
    project_id?: string;
    start_date?: string;
    end_date?: string;
  }) {
    const where: any = {};

    if (filters?.client_id) {
      where.client_id = filters.client_id;
    }

    if (filters?.project_id) {
      where.project_id = filters.project_id;
    }

    if (filters?.start_date || filters?.end_date) {
      where.issue_date = {};
      if (filters.start_date) {
        where.issue_date.gte = new Date(filters.start_date);
      }
      if (filters.end_date) {
        where.issue_date.lte = new Date(filters.end_date);
      }
    }

    const [byStatus, totals, overdue] = await Promise.all([
      prisma.invoices.groupBy({
        by: ['status'],
        where,
        _sum: { total: true },
        _count: true,
      }),
      prisma.invoices.aggregate({
        where,
        _sum: { total: true },
        _count: true,
      }),
      prisma.invoices.count({
        where: {
          ...where,
          status: { not: 'Paid' },
          due_date: { lt: new Date() },
        },
      }),
    ]);

    return {
      by_status: byStatus.map((item) => ({
        status: item.status,
        count: item._count,
        total: item._sum.total || 0,
      })),
      totals: {
        count: totals._count,
        total_amount: totals._sum.total || 0,
      },
      overdue_count: overdue,
    };
  }
}
