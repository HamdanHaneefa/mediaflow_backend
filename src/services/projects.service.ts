import { PrismaClient, Prisma } from '@prisma/client';
import { CreateProjectInput, UpdateProjectInput } from '../validators/projects.validator';
import { NotFoundError, ConflictError } from '../utils/errors';
import { paginate, PaginatedResult } from '../utils/pagination';

const prisma = new PrismaClient();

export class ProjectsService {
  async createProject(data: CreateProjectInput) {
    // Validate client exists if provided
    if (data.client_id) {
      const clientExists = await prisma.contacts.findUnique({
        where: { id: data.client_id },
      });

      if (!clientExists) {
        throw new NotFoundError('Client not found');
      }
    }

    // Convert dates to Date objects if provided as strings
    const projectData: any = { ...data };
    if (data.start_date) {
      projectData.start_date = new Date(data.start_date);
    }
    if (data.end_date) {
      projectData.end_date = new Date(data.end_date);
    }

    const project = await prisma.projects.create({
      data: {
        ...projectData,
        updated_at: new Date(),
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            expenses: true,
            team_project_assignments: true,
          },
        },
      },
    });

    return project;
  }

  async getProject(id: string) {
    const project = await prisma.projects.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
            phone: true,
          },
        },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            due_date: true,
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { created_at: 'desc' },
          take: 20,
        },
        expenses: {
          select: {
            id: true,
            title: true,
            amount: true,
            status: true,
            expense_date: true,
          },
          orderBy: { expense_date: 'desc' },
          take: 10,
        },
        income: {
          select: {
            id: true,
            title: true,
            amount: true,
            status: true,
            expected_date: true,
          },
          orderBy: { expected_date: 'desc' },
          take: 10,
        },
        team_project_assignments: {
          select: {
            team: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        project_assignments: {
          select: {
            id: true,
            role_in_project: true,
            is_lead: true,
            team_member: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                position: true,
              },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
            expenses: true,
            income: true,
            proposals: true,
            events: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    return project;
  }

  async listProjects(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    phase?: string;
    client_id?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResult<any>> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      phase,
      client_id,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = params;

    const where: Prisma.projectsWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (phase) {
      where.phase = phase;
    }

    if (client_id) {
      where.client_id = client_id;
    }

    const orderBy: Prisma.projectsOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    return paginate(
      prisma.projects,
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
          _count: {
            select: {
              tasks: true,
              expenses: true,
              team_project_assignments: true,
            },
          },
        },
      }
    );
  }

  async updateProject(id: string, data: UpdateProjectInput) {
    // Check if project exists
    const existingProject = await prisma.projects.findUnique({
      where: { id },
    });

    if (!existingProject) {
      throw new NotFoundError('Project not found');
    }

    // Validate client exists if provided
    if (data.client_id) {
      const clientExists = await prisma.contacts.findUnique({
        where: { id: data.client_id },
      });

      if (!clientExists) {
        throw new NotFoundError('Client not found');
      }
    }

    // Convert dates to Date objects if provided as strings
    const projectData: any = { ...data };
    if (data.start_date) {
      projectData.start_date = new Date(data.start_date);
    }
    if (data.end_date) {
      projectData.end_date = new Date(data.end_date);
    }

    const project = await prisma.projects.update({
      where: { id },
      data: {
        ...projectData,
        updated_at: new Date(),
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            expenses: true,
            team_project_assignments: true,
          },
        },
      },
    });

    return project;
  }

  async deleteProject(id: string) {
    // Check if project exists
    const project = await prisma.projects.findUnique({
      where: { id },
      include: {
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

    // Soft delete by updating status to 'Cancelled'
    await prisma.projects.update({
      where: { id },
      data: {
        status: 'Cancelled',
        updated_at: new Date(),
      },
    });

    return { message: 'Project archived successfully' };
  }

  async getProjectStats(id: string) {
    const project = await prisma.projects.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const [
      taskStats,
      expenseTotal,
      incomeTotal,
      teamMemberCount,
    ] = await Promise.all([
      prisma.tasks.groupBy({
        by: ['status'],
        where: { project_id: id },
        _count: true,
      }),
      prisma.expenses.aggregate({
        where: {
          project_id: id,
          status: 'Approved',
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.income.aggregate({
        where: {
          project_id: id,
          status: 'Received',
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.project_assignments.count({
        where: { project_id: id },
      }),
    ]);

    const tasks = {
      total: taskStats.reduce((acc, stat) => acc + stat._count, 0),
      byStatus: taskStats.reduce((acc, stat) => {
        acc[stat.status] = stat._count;
        return acc;
      }, {} as Record<string, number>),
    };

    return {
      tasks,
      totalExpenses: expenseTotal._sum.amount || 0,
      totalIncome: incomeTotal._sum.amount || 0,
      profit: (incomeTotal._sum.amount || 0) - (expenseTotal._sum.amount || 0),
      teamMembers: teamMemberCount,
    };
  }
}

export default new ProjectsService();
