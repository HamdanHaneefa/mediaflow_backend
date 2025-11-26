import { PrismaClient } from '@prisma/client';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { paginate, PaginationParams, PaginatedResult } from '../utils/pagination';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Lead Service
export class LeadService {
  async create(data: any, createdBy: string) {
    const lead = await prisma.leads.create({
      data: {
        ...data,
        status: data.status || 'New',
        score: data.score || 0,
        created_by: createdBy,
      },
    });

    return lead;
  }

  async list(params: PaginationParams & {
    status?: string;
    source?: string;
    min_score?: number;
    max_score?: number;
  }): Promise<PaginatedResult<any>> {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      sortBy = 'created_at', 
      sortOrder = 'desc',
      status,
      source,
      min_score,
      max_score
    } = params;

    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Source filter
    if (source) {
      where.source = source;
    }

    // Score range filter
    if (min_score !== undefined || max_score !== undefined) {
      where.score = {};
      if (min_score !== undefined) {
        where.score.gte = min_score;
      }
      if (max_score !== undefined) {
        where.score.lte = max_score;
      }
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const result = await paginate(
      prisma.leads,
      {
        where,
        orderBy,
        include: {
          creator: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          converted_contact: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              proposals: true,
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
    const lead = await prisma.leads.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        converted_contact: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            company: true,
          },
        },
        proposals: {
          select: {
            id: true,
            proposal_number: true,
            title: true,
            status: true,
            total: true,
            created_at: true,
          },
          orderBy: {
            created_at: 'desc',
          },
        },
      },
    });

    if (!lead) {
      throw new NotFoundError('Lead not found');
    }

    return lead;
  }

  async update(id: string, data: any) {
    await this.getById(id);

    const updated = await prisma.leads.update({
      where: { id },
      data,
      include: {
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

  async delete(id: string) {
    const lead = await this.getById(id);

    if (lead.status === 'Converted') {
      throw new BadRequestError('Cannot delete converted lead');
    }

    await prisma.leads.delete({
      where: { id },
    });

    return { message: 'Lead deleted successfully' };
  }

  async convert(id: string, options?: {
    create_project?: boolean;
    project_title?: string;
    project_budget?: number;
  }) {
    const lead = await this.getById(id);

    if (lead.status === 'Converted') {
      throw new BadRequestError('Lead already converted');
    }

    // Create contact from lead
    const contact = await prisma.contacts.create({
      data: {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        role: 'Client',
        status: 'Active',
        notes: lead.notes,
        tags: lead.tags,
      },
    });

    // Update lead status
    const updatedLead = await prisma.leads.update({
      where: { id },
      data: {
        status: 'Converted',
        converted_contact_id: contact.id,
        converted_at: new Date(),
      },
    });

    let project = null;

    // Optionally create project
    if (options?.create_project) {
      project = await prisma.projects.create({
        data: {
          title: options.project_title || `Project for ${lead.name}`,
          client_id: contact.id,
          status: 'Active',
          type: lead.project_type || 'Other',
          budget: options.project_budget || lead.budget,
        },
      });
    }

    return {
      lead: updatedLead,
      contact,
      project,
    };
  }

  async getStats(filters?: {
    start_date?: string;
    end_date?: string;
  }) {
    const where: any = {};

    if (filters?.start_date || filters?.end_date) {
      where.created_at = {};
      if (filters.start_date) {
        where.created_at.gte = new Date(filters.start_date);
      }
      if (filters.end_date) {
        where.created_at.lte = new Date(filters.end_date);
      }
    }

    const [byStatus, bySource, totals, conversions] = await Promise.all([
      prisma.leads.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      prisma.leads.groupBy({
        by: ['source'],
        where,
        _count: true,
      }),
      prisma.leads.aggregate({
        where,
        _count: true,
        _avg: { score: true },
        _sum: { budget: true },
      }),
      prisma.leads.count({
        where: {
          ...where,
          status: 'Converted',
        },
      }),
    ]);

    const conversionRate = totals._count > 0 ? (conversions / totals._count) * 100 : 0;

    return {
      by_status: byStatus.map((item) => ({
        status: item.status,
        count: item._count,
      })),
      by_source: bySource.map((item) => ({
        source: item.source,
        count: item._count,
      })),
      totals: {
        count: totals._count,
        average_score: totals._avg.score || 0,
        total_budget: totals._sum.budget || 0,
      },
      conversions: {
        count: conversions,
        rate: conversionRate,
      },
    };
  }
}

// Proposal Service
export class ProposalService {
  async create(data: any, createdBy: string) {
    const { items, ...proposalData } = data;

    // Verify client or lead exists
    if (data.client_id) {
      const client = await prisma.contacts.findUnique({
        where: { id: data.client_id },
      });
      if (!client) {
        throw new NotFoundError('Client not found');
      }
    }

    if (data.lead_id) {
      const lead = await prisma.leads.findUnique({
        where: { id: data.lead_id },
      });
      if (!lead) {
        throw new NotFoundError('Lead not found');
      }
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + item.amount, 0);
    const taxAmount = proposalData.tax_rate ? (subtotal * proposalData.tax_rate) / 100 : 0;
    const discount = proposalData.discount || 0;
    const total = subtotal + taxAmount - discount;

    // Generate public token
    const publicToken = crypto.randomBytes(32).toString('hex');

    const proposal = await prisma.proposals.create({
      data: {
        proposal_number: proposalData.proposal_number,
        title: proposalData.title,
        client_id: proposalData.client_id,
        lead_id: proposalData.lead_id,
        status: proposalData.status || 'Draft',
        valid_until: new Date(proposalData.valid_until),
        subtotal,
        tax_rate: proposalData.tax_rate || 0,
        tax_amount: taxAmount,
        discount,
        total,
        introduction: proposalData.introduction,
        scope_of_work: proposalData.scope_of_work,
        deliverables: proposalData.deliverables,
        timeline: proposalData.timeline,
        terms: proposalData.terms,
        notes: proposalData.notes,
        public_token: publicToken,
        created_by: createdBy,
        items: {
          create: items.map((item: any) => ({
            title: item.title,
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
            company: true,
          },
        },
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
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

    return proposal;
  }

  async list(params: PaginationParams & {
    status?: string;
    client_id?: string;
    lead_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<PaginatedResult<any>> {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      sortBy = 'created_at', 
      sortOrder = 'desc',
      status,
      client_id,
      lead_id,
      start_date,
      end_date 
    } = params;

    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { proposal_number: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { client: { name: { contains: search, mode: 'insensitive' } } },
        { lead: { name: { contains: search, mode: 'insensitive' } } },
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

    // Lead filter
    if (lead_id) {
      where.lead_id = lead_id;
    }

    // Date range filter
    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) {
        where.created_at.gte = new Date(start_date);
      }
      if (end_date) {
        where.created_at.lte = new Date(end_date);
      }
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const result = await paginate(
      prisma.proposals,
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
          lead: {
            select: {
              id: true,
              name: true,
              email: true,
              company: true,
            },
          },
          items: true,
          _count: {
            select: {
              items: true,
              views: true,
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
    const proposal = await prisma.proposals.findUnique({
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
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            company: true,
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
        signature: true,
        views: {
          orderBy: {
            viewed_at: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!proposal) {
      throw new NotFoundError('Proposal not found');
    }

    return proposal;
  }

  async getByToken(token: string) {
    const proposal = await prisma.proposals.findUnique({
      where: { public_token: token },
      include: {
        client: {
          select: {
            name: true,
            email: true,
            phone: true,
            address: true,
            company: true,
          },
        },
        lead: {
          select: {
            name: true,
            email: true,
            phone: true,
            company: true,
          },
        },
        items: {
          orderBy: {
            created_at: 'asc',
          },
        },
        signature: true,
      },
    });

    if (!proposal) {
      throw new NotFoundError('Proposal not found');
    }

    // Check if expired
    if (new Date() > proposal.valid_until && proposal.status !== 'Accepted') {
      await prisma.proposals.update({
        where: { id: proposal.id },
        data: { status: 'Expired' },
      });
      proposal.status = 'Expired';
    }

    return proposal;
  }

  async update(id: string, data: any) {
    const proposal = await this.getById(id);

    if (['Accepted', 'Rejected'].includes(proposal.status)) {
      throw new BadRequestError(`Cannot update ${proposal.status.toLowerCase()} proposal`);
    }

    const { items, ...updateData } = data;

    // Calculate new totals if items are provided
    let updates: any = { ...updateData };

    if (items) {
      const subtotal = items.reduce((sum: number, item: any) => sum + item.amount, 0);
      const taxAmount = (updateData.tax_rate !== undefined ? updateData.tax_rate : proposal.tax_rate) 
        ? (subtotal * ((updateData.tax_rate !== undefined ? updateData.tax_rate : proposal.tax_rate) / 100))
        : 0;
      const discount = updateData.discount !== undefined ? updateData.discount : proposal.discount;
      const total = subtotal + taxAmount - discount;

      updates = {
        ...updates,
        subtotal,
        tax_amount: taxAmount,
        total,
      };

      // Delete existing items and create new ones
      await prisma.proposal_items.deleteMany({
        where: { proposal_id: id },
      });
    }

    // Convert dates if provided
    if (updates.valid_until) {
      updates.valid_until = new Date(updates.valid_until);
    }

    const updated = await prisma.proposals.update({
      where: { id },
      data: {
        ...updates,
        ...(items && {
          items: {
            create: items.map((item: any) => ({
              title: item.title,
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
            company: true,
          },
        },
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
        items: true,
      },
    });

    return updated;
  }

  async updateStatus(id: string, status: string) {
    await this.getById(id);

    const updated = await prisma.proposals.update({
      where: { id },
      data: {
        status,
        ...(status === 'Sent' && { sent_at: new Date() }),
        ...(status === 'Accepted' && { accepted_at: new Date() }),
        ...(status === 'Rejected' && { rejected_at: new Date() }),
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: true,
      },
    });

    return updated;
  }

  async delete(id: string) {
    const proposal = await this.getById(id);

    if (proposal.status === 'Accepted') {
      throw new BadRequestError('Cannot delete accepted proposal');
    }

    // Delete proposal items, views, and signature first
    await prisma.$transaction([
      prisma.proposal_items.deleteMany({ where: { proposal_id: id } }),
      prisma.proposal_views.deleteMany({ where: { proposal_id: id } }),
      prisma.proposal_signatures.deleteMany({ where: { proposal_id: id } }),
      prisma.proposals.delete({ where: { id } }),
    ]);

    return { message: 'Proposal deleted successfully' };
  }

  async trackView(token: string, data: any) {
    const proposal = await this.getByToken(token);

    // Record view
    await prisma.proposal_views.create({
      data: {
        proposal_id: proposal.id,
        duration: data.duration || 0,
        page_views: data.page_views || 1,
      },
    });

    // Update proposal status if first view
    if (proposal.status === 'Sent') {
      await prisma.proposals.update({
        where: { id: proposal.id },
        data: {
          status: 'Viewed',
          first_viewed_at: new Date(),
        },
      });
    }

    return { message: 'View tracked successfully' };
  }

  async sign(token: string, signatureData: any) {
    const proposal = await this.getByToken(token);

    if (proposal.status === 'Accepted') {
      throw new BadRequestError('Proposal already signed');
    }

    if (proposal.status === 'Rejected') {
      throw new BadRequestError('Cannot sign rejected proposal');
    }

    if (proposal.status === 'Expired') {
      throw new BadRequestError('Proposal has expired');
    }

    // Create signature
    await prisma.proposal_signatures.create({
      data: {
        proposal_id: proposal.id,
        signature_data: signatureData.signature_data,
        signer_name: signatureData.signer_name,
        signer_email: signatureData.signer_email,
        signer_title: signatureData.signer_title,
        ip_address: signatureData.ip_address,
      },
    });

    // Update proposal status
    const updated = await prisma.proposals.update({
      where: { id: proposal.id },
      data: {
        status: 'Accepted',
        accepted_at: new Date(),
      },
      include: {
        client: true,
        lead: true,
        items: true,
        signature: true,
      },
    });

    return updated;
  }

  async getStats(filters?: {
    client_id?: string;
    lead_id?: string;
    start_date?: string;
    end_date?: string;
  }) {
    const where: any = {};

    if (filters?.client_id) {
      where.client_id = filters.client_id;
    }

    if (filters?.lead_id) {
      where.lead_id = filters.lead_id;
    }

    if (filters?.start_date || filters?.end_date) {
      where.created_at = {};
      if (filters.start_date) {
        where.created_at.gte = new Date(filters.start_date);
      }
      if (filters.end_date) {
        where.created_at.lte = new Date(filters.end_date);
      }
    }

    const [byStatus, totals, avgValues] = await Promise.all([
      prisma.proposals.groupBy({
        by: ['status'],
        where,
        _sum: { total: true },
        _count: true,
      }),
      prisma.proposals.aggregate({
        where,
        _sum: { total: true },
        _count: true,
      }),
      prisma.proposals.aggregate({
        where,
        _avg: { total: true },
      }),
    ]);

    const acceptedCount = byStatus.find((s) => s.status === 'Accepted')?._count || 0;
    const acceptanceRate = totals._count > 0 ? (acceptedCount / totals._count) * 100 : 0;

    return {
      by_status: byStatus.map((item) => ({
        status: item.status,
        count: item._count,
        total: item._sum.total || 0,
      })),
      totals: {
        count: totals._count,
        total_value: totals._sum.total || 0,
        average_value: avgValues._avg.total || 0,
      },
      acceptance: {
        count: acceptedCount,
        rate: acceptanceRate,
      },
    };
  }
}
