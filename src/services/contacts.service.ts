import { PrismaClient, Prisma } from '@prisma/client';
import { CreateContactInput, UpdateContactInput } from '../validators/contacts.validator';
import { NotFoundError, ConflictError } from '../utils/errors';
import { paginate, PaginationParams, PaginatedResult } from '../utils/pagination';

const prisma = new PrismaClient();

export class ContactsService {
  async createContact(data: CreateContactInput) {
    // Check if email already exists
    const existingContact = await prisma.contacts.findUnique({
      where: { email: data.email },
    });

    if (existingContact) {
      throw new ConflictError('Contact with this email already exists');
    }

    const contact = await prisma.contacts.create({
      data: {
        ...data,
        updated_at: new Date(),
      },
      include: {
        projects_as_client: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        _count: {
          select: {
            projects_as_client: true,
            tasks_assigned: true,
            proposals: true,
          },
        },
      },
    });

    return contact;
  }

  async getContact(id: string) {
    const contact = await prisma.contacts.findUnique({
      where: { id },
      include: {
        projects_as_client: {
          select: {
            id: true,
            title: true,
            status: true,
            budget: true,
            start_date: true,
            end_date: true,
          },
          orderBy: { created_at: 'desc' },
        },
        tasks_assigned: {
          select: {
            id: true,
            title: true,
            status: true,
            due_date: true,
            priority: true,
          },
          orderBy: { due_date: 'asc' },
          take: 10,
        },
        proposals: {
          select: {
            id: true,
            title: true,
            status: true,
            total_amount: true,
            created_at: true,
          },
          orderBy: { created_at: 'desc' },
        },
        _count: {
          select: {
            projects_as_client: true,
            tasks_assigned: true,
            proposals: true,
            income_records: true,
          },
        },
      },
    });

    if (!contact) {
      throw new NotFoundError('Contact not found');
    }

    return contact;
  }

  async listContacts(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResult<any>> {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      status,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = params;

    const where: Prisma.contactsWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    const orderBy: Prisma.contactsOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    return paginate(
      prisma.contacts,
      { page, limit },
      {
        where,
        orderBy,
        include: {
          _count: {
            select: {
              projects_as_client: true,
              tasks_assigned: true,
              proposals: true,
            },
          },
        },
      }
    );
  }

  async updateContact(id: string, data: UpdateContactInput) {
    // Check if contact exists
    const existingContact = await prisma.contacts.findUnique({
      where: { id },
    });

    if (!existingContact) {
      throw new NotFoundError('Contact not found');
    }

    // If email is being updated, check if new email already exists
    if (data.email && data.email !== existingContact.email) {
      const emailExists = await prisma.contacts.findUnique({
        where: { email: data.email },
      });

      if (emailExists) {
        throw new ConflictError('Contact with this email already exists');
      }
    }

    const contact = await prisma.contacts.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
      include: {
        _count: {
          select: {
            projects_as_client: true,
            tasks_assigned: true,
            proposals: true,
          },
        },
      },
    });

    return contact;
  }

  async deleteContact(id: string) {
    // Check if contact exists
    const contact = await prisma.contacts.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            projects_as_client: true,
            tasks_assigned: true,
            proposals: true,
          },
        },
      },
    });

    if (!contact) {
      throw new NotFoundError('Contact not found');
    }

    // Check if contact has dependencies
    if (contact._count.projects_as_client > 0) {
      throw new ConflictError(
        `Cannot delete contact with ${contact._count.projects_as_client} associated project(s)`
      );
    }

    await prisma.contacts.delete({
      where: { id },
    });

    return { message: 'Contact deleted successfully' };
  }

  async getContactStats(id: string) {
    const contact = await prisma.contacts.findUnique({
      where: { id },
    });

    if (!contact) {
      throw new NotFoundError('Contact not found');
    }

    const [projectCount, taskCount, proposalCount, totalRevenue] = await Promise.all([
      prisma.projects.count({
        where: { client_id: id },
      }),
      prisma.tasks.count({
        where: { assigned_to: id },
      }),
      prisma.proposals.count({
        where: { client_id: id },
      }),
      prisma.income.aggregate({
        where: {
          client_id: id,
          status: 'Received',
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    return {
      projects: projectCount,
      tasks: taskCount,
      proposals: proposalCount,
      totalRevenue: totalRevenue._sum.amount || 0,
    };
  }
}

export default new ContactsService();
