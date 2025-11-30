import { PrismaClient, Prisma } from '@prisma/client';
import { CreateContactInput, UpdateContactInput } from '../validators/contacts.validator';
import { NotFoundError, ConflictError } from '../utils/errors';
import { paginate, PaginationParams, PaginatedResult } from '../utils/pagination';

const prisma = new PrismaClient();

// Helper function to transform contact data to match frontend expectations
function transformContact(contact: any) {
  if (!contact) return contact;
  
  // Split name into first_name and last_name if it exists
  const nameParts = contact.name ? contact.name.trim().split(' ') : ['', ''];
  const first_name = nameParts[0] || '';
  const last_name = nameParts.slice(1).join(' ') || '';
  
  return {
    ...contact,
    first_name,
    last_name,
  };
}

// Helper function to transform array of contacts
function transformContacts(contacts: any[]) {
  return contacts.map(transformContact);
}

// Helper function to combine first_name and last_name into name for database
function normalizeContactInput(data: any) {
  const normalized = { ...data };
  
  // If first_name and last_name are provided, combine them into name
  if (data.first_name || data.last_name) {
    normalized.name = `${data.first_name || ''} ${data.last_name || ''}`.trim();
    // Remove first_name and last_name from the data to be saved
    delete normalized.first_name;
    delete normalized.last_name;
  }
  
  return normalized;
}

export class ContactsService {
  async createContact(data: CreateContactInput) {
    // Normalize input: combine first_name + last_name into name if needed
    const normalizedData = normalizeContactInput(data);
    
    // Check if email already exists
    const existingContact = await prisma.contacts.findUnique({
      where: { email: normalizedData.email },
    });

    if (existingContact) {
      throw new ConflictError('Contact with this email already exists');
    }

    const contact = await prisma.contacts.create({
      data: {
        ...normalizedData,
        updated_at: new Date(),
      },
      include: {
        projects: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        _count: {
          select: {
            projects: true,
            tasks: true,
            proposals: true,
          },
        },
      },
    });

    return transformContact(contact);
  }

  async getContact(id: string) {
    const contact = await prisma.contacts.findUnique({
      where: { id },
      include: {
        projects: {
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
        tasks: {
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
            projects: true,
            tasks: true,
            proposals: true,
            income: true,
          },
        },
      },
    });

    if (!contact) {
      throw new NotFoundError('Contact not found');
    }

    return transformContact(contact);
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

    const result = await paginate(
      prisma.contacts,
      { page, limit },
      {
        where,
        orderBy,
        include: {
          _count: {
            select: {
              projects: true,
              tasks: true,
              proposals: true,
            },
          },
        },
      }
    );
    
    // Transform contacts to include first_name and last_name
    return {
      ...result,
      items: transformContacts(result.items),
    };
  }

  async updateContact(id: string, data: UpdateContactInput) {
    // Normalize input: combine first_name + last_name into name if needed
    const normalizedData = normalizeContactInput(data);
    
    // Check if contact exists
    const existingContact = await prisma.contacts.findUnique({
      where: { id },
    });

    if (!existingContact) {
      throw new NotFoundError('Contact not found');
    }

    // If email is being updated, check if new email already exists
    if (normalizedData.email && normalizedData.email !== existingContact.email) {
      const emailExists = await prisma.contacts.findUnique({
        where: { email: normalizedData.email },
      });

      if (emailExists) {
        throw new ConflictError('Contact with this email already exists');
      }
    }

    const contact = await prisma.contacts.update({
      where: { id },
      data: {
        ...normalizedData,
        updated_at: new Date(),
      },
      include: {
        _count: {
          select: {
            projects: true,
            tasks: true,
            proposals: true,
          },
        },
      },
    });

    return transformContact(contact);
  }

  async deleteContact(id: string) {
    // Check if contact exists
    const contact = await prisma.contacts.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            projects: true,
            tasks: true,
            proposals: true,
          },
        },
      },
    });

    if (!contact) {
      throw new NotFoundError('Contact not found');
    }

    // Check if contact has dependencies
    if (contact._count.projects > 0) {
      throw new ConflictError(
        `Cannot delete contact with ${contact._count.projects} associated project(s)`
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
