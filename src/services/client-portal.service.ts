// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import { ForbiddenError, NotFoundError } from '../utils/errors';

const prisma = new PrismaClient();

export class ClientPortalService {
  /**
   * Get dashboard data for client
   */
  async getDashboard(contactId: string, period: string = 'month') {
    // Get date range based on period
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date(2000, 0, 1);
        break;
    }

    // Parallel queries for dashboard metrics
    const [
      activeProjects,
      totalProjects,
      pendingInvoices,
      paidInvoices,
      totalInvoicesAmount,
      paidAmount,
      activeProposals,
      recentActivities,
    ] = await Promise.all([
      // Active projects count
      prisma.projects.count({
        where: {
          client_id: contactId,
          status: { in: ['Active', 'In Progress'] },
        },
      }),

      // Total projects
      prisma.projects.count({
        where: { client_id: contactId },
      }),

      // Pending invoices
      prisma.income.count({
        where: {
          client_id: contactId,
          income_type: 'Invoice',
          status: { in: ['Expected', 'Pending'] },
        },
      }),

      // Paid invoices
      prisma.income.count({
        where: {
          client_id: contactId,
          income_type: 'Invoice',
          status: 'Received',
        },
      }),

      // Total invoices amount
      prisma.income.aggregate({
        where: {
          client_id: contactId,
          income_type: 'Invoice',
        },
        _sum: { amount: true },
      }),

      // Paid amount
      prisma.income.aggregate({
        where: {
          client_id: contactId,
          income_type: 'Invoice',
          status: 'Received',
        },
        _sum: { amount: true },
      }),

      // Active proposals
      prisma.proposals.count({
        where: {
          client_id: contactId,
          status: { in: ['Sent', 'Viewed'] },
        },
      }),

      // Recent activities (last 10)
      this.getRecentActivities(contactId, 10),
    ]);

    return {
      summary: {
        activeProjects,
        totalProjects,
        pendingInvoices,
        paidInvoices,
        totalInvoicesAmount: Number(totalInvoicesAmount._sum.amount || 0),
        paidAmount: Number(paidAmount._sum.amount || 0),
        outstandingAmount:
          Number(totalInvoicesAmount._sum.amount || 0) - Number(paidAmount._sum.amount || 0),
        activeProposals,
      },
      recentActivities,
      period,
    };
  }

  /**
   * Get recent activities for client
   */
  private async getRecentActivities(contactId: string, limit: number = 10) {
    const activities = [];

    // Get recent projects
    const recentProjects = await prisma.projects.findMany({
      where: { client_id: contactId },
      orderBy: { updated_at: 'desc' },
      take: 3,
      select: {
        id: true,
        title: true,
        status: true,
        updated_at: true,
      },
    });

    activities.push(
      ...recentProjects.map((p) => ({
        type: 'project',
        entityId: p.id,
        title: p.title,
        description: `Project status: ${p.status}`,
        createdAt: p.updated_at,
      }))
    );

    // Get recent invoices
    const recentInvoices = await prisma.income.findMany({
      where: {
        client_id: contactId,
        income_type: 'Invoice',
      },
      orderBy: { created_at: 'desc' },
      take: 3,
      select: {
        id: true,
        title: true,
        status: true,
        amount: true,
        created_at: true,
      },
    });

    activities.push(
      ...recentInvoices.map((i) => ({
        type: 'invoice',
        entityId: i.id,
        title: i.title,
        description: `Invoice ${i.status}: $${i.amount}`,
        createdAt: i.created_at,
      }))
    );

    // Get recent proposals
    const recentProposals = await prisma.proposals.findMany({
      where: { client_id: contactId },
      orderBy: { created_at: 'desc' },
      take: 3,
      select: {
        id: true,
        title: true,
        status: true,
        created_at: true,
      },
    });

    activities.push(
      ...recentProposals.map((p) => ({
        type: 'proposal',
        entityId: p.id,
        title: p.title,
        description: `Proposal ${p.status}`,
        createdAt: p.created_at,
      }))
    );

    // Sort by date and limit
    return activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limit);
  }

  /**
   * Get client profile
   */
  async getProfile(contactId: string) {
    const contact = await prisma.contacts.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      throw new NotFoundError('Contact not found');
    }

    return contact;
  }

  /**
   * Update client profile
   */
  async updateProfile(contactId: string, data: { name?: string; phone?: string; company?: string }) {
    const contact = await prisma.contacts.update({
      where: { id: contactId },
      data,
    });

    return contact;
  }

  /**
   * Get all projects for client with pagination
   */
  async getProjects(
    contactId: string,
    options: {
      status?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ) {
    const { status, page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = options;

    const where: any = { client_id: contactId };
    if (status) {
      where.status = status;
    }

    const [projects, total] = await Promise.all([
      prisma.projects.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          tasks: {
            select: {
              id: true,
              title: true,
              status: true,
              due_date: true,
            },
          },
        },
      }),
      prisma.projects.count({ where }),
    ]);

    return {
      projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single project details
   */
  async getProjectById(contactId: string, projectId: string) {
    const project = await prisma.projects.findUnique({
      where: { id: projectId },
      include: {
        client: true,
        tasks: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            due_date: true,
          },
          orderBy: { created_at: 'desc' },
        },
        _count: {
          select: {
            tasks: true,
            expenses: true,
            income: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    if (project.client_id !== contactId) {
      throw new ForbiddenError('Access denied');
    }

    // Get project comments
    const comments = await prisma.project_comments.findMany({
      where: { project_id: projectId },
      orderBy: { created_at: 'desc' },
    });

    return { ...project, comments };
  }

  /**
   * Add comment to project
   */
  async addProjectComment(contactId: string, projectId: string, comment: string, clientUserId: string) {
    // Verify project access
    const project = await prisma.projects.findUnique({
      where: { id: projectId },
      select: { client_id: true },
    });

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    if (project.client_id !== contactId) {
      throw new ForbiddenError('Access denied');
    }

    const newComment = await prisma.project_comments.create({
      data: {
        project_id: projectId,
        client_user_id: clientUserId,
        comment,
      },
    });

    // Log activity
    await prisma.client_activities.create({
      data: {
        client_user_id: clientUserId,
        action: 'add_project_comment',
        entity_type: 'project',
        entity_id: projectId,
      },
    });

    return newComment;
  }

  /**
   * Get all invoices for client with pagination
   */
  async getInvoices(
    contactId: string,
    options: {
      status?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ) {
    const { status, page = 1, limit = 10, sortBy = 'expected_date', sortOrder = 'desc' } = options;

    const where: any = {
      client_id: contactId,
      income_type: 'Invoice',
    };
    if (status) {
      where.status = status;
    }

    const [invoices, total] = await Promise.all([
      prisma.income.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          project: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
      prisma.income.count({ where }),
    ]);

    return {
      invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single invoice details
   */
  async getInvoiceById(contactId: string, invoiceId: string) {
    const invoice = await prisma.income.findUnique({
      where: { id: invoiceId },
      include: {
        project: {
          select: {
            id: true,
            title: true,
          },
        },
        client: true,
      },
    });

    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    if (invoice.client_id !== contactId) {
      throw new ForbiddenError('Access denied');
    }

    return invoice;
  }

  /**
   * Get all proposals for client with pagination
   */
  async getProposals(
    contactId: string,
    options: {
      status?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ) {
    const { status, page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = options;

    const where: any = { client_id: contactId };
    if (status) {
      where.status = status;
    }

    const [proposals, total] = await Promise.all([
      prisma.proposals.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          project: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
      prisma.proposals.count({ where }),
    ]);

    return {
      proposals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single proposal details
   */
  async getProposalById(contactId: string, proposalId: string) {
    const proposal = await prisma.proposals.findUnique({
      where: { id: proposalId },
      include: {
        project: {
          select: {
            id: true,
            title: true,
          },
        },
        client: true,
        proposal_responses: {
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!proposal) {
      throw new NotFoundError('Proposal not found');
    }

    if (proposal.client_id !== contactId) {
      throw new ForbiddenError('Access denied');
    }

    // Update viewed_at if not viewed yet
    if (!proposal.viewed_at) {
      await prisma.proposals.update({
        where: { id: proposalId },
        data: { viewed_at: new Date() },
      });
    }

    return proposal;
  }

  /**
   * Respond to proposal
   */
  async respondToProposal(
    contactId: string,
    proposalId: string,
    clientUserId: string,
    status: string,
    comments?: string
  ) {
    // Verify proposal access
    const proposal = await prisma.proposals.findUnique({
      where: { id: proposalId },
      select: { client_id: true, status: true },
    });

    if (!proposal) {
      throw new NotFoundError('Proposal not found');
    }

    if (proposal.client_id !== contactId) {
      throw new ForbiddenError('Access denied');
    }

    // Create response
    const response = await prisma.proposal_responses.create({
      data: {
        proposal_id: proposalId,
        client_user_id: clientUserId,
        status,
        comments,
      },
    });

    // Update proposal status
    let proposalStatus = proposal.status;
    if (status === 'accepted') {
      proposalStatus = 'Accepted';
      await prisma.proposals.update({
        where: { id: proposalId },
        data: {
          status: proposalStatus,
          accepted_at: new Date(),
        },
      });
    } else if (status === 'rejected') {
      proposalStatus = 'Rejected';
      await prisma.proposals.update({
        where: { id: proposalId },
        data: {
          status: proposalStatus,
          rejected_at: new Date(),
          rejection_reason: comments,
        },
      });
    }

    // Log activity
    await prisma.client_activities.create({
      data: {
        client_user_id: clientUserId,
        action: `proposal_${status}`,
        entity_type: 'proposal',
        entity_id: proposalId,
      },
    });

    return response;
  }

  /**
   * Get client activities feed
   */
  async getActivities(
    contactId: string,
    page: number = 1,
    limit: number = 20,
    clientUserId?: string
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (clientUserId) {
      where.client_user_id = clientUserId;
    } else {
      // Get all client users for this contact
      const clientUsers = await prisma.client_users.findMany({
        where: { contact_id: contactId },
        select: { id: true },
      });
      where.client_user_id = { in: clientUsers.map(u => u.id) };
    }

    const [activities, total] = await Promise.all([
      prisma.client_activities.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          client_user: {
            select: {
              email: true,
              contact: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
      prisma.client_activities.count({ where }),
    ]);

    return {
      activities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export default new ClientPortalService();
