import { PrismaClient, Prisma } from '@prisma/client';
import { CreateTaskInput, UpdateTaskInput } from '../validators/tasks.validator';
import { NotFoundError } from '../utils/errors';
import { paginate, PaginatedResult } from '../utils/pagination';

const prisma = new PrismaClient();

export class TasksService {
  async createTask(data: CreateTaskInput) {
    // Validate project exists if provided
    if (data.project_id) {
      const projectExists = await prisma.projects.findUnique({
        where: { id: data.project_id },
      });

      if (!projectExists) {
        throw new NotFoundError('Project not found');
      }
    }

    // Validate assignee exists if provided
    if (data.assigned_to) {
      const assigneeExists = await prisma.contacts.findUnique({
        where: { id: data.assigned_to },
      });

      if (!assigneeExists) {
        throw new NotFoundError('Assignee not found');
      }
    }

    // Convert due_date to Date object if provided as string
    const taskData: any = { ...data };
    if (data.due_date) {
      taskData.due_date = new Date(data.due_date);
    }

    const task = await prisma.tasks.create({
      data: {
        ...taskData,
        updated_at: new Date(),
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return task;
  }

  async getTask(id: string) {
    const task = await prisma.tasks.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
            phase: true,
            client: {
              select: {
                id: true,
                name: true,
                company: true,
              },
            },
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            company: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    return task;
  }

  async listTasks(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    priority?: string;
    project_id?: string;
    assigned_to?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResult<any>> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      priority,
      project_id,
      assigned_to,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = params;

    const where: Prisma.tasksWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (project_id) {
      where.project_id = project_id;
    }

    if (assigned_to) {
      where.assigned_to = assigned_to;
    }

    const orderBy: Prisma.tasksOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    return paginate(
      prisma.tasks,
      { page, limit },
      {
        where,
        orderBy,
        include: {
          project: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }
    );
  }

  async updateTask(id: string, data: UpdateTaskInput) {
    // Check if task exists
    const existingTask = await prisma.tasks.findUnique({
      where: { id },
    });

    if (!existingTask) {
      throw new NotFoundError('Task not found');
    }

    // Validate project exists if provided
    if (data.project_id) {
      const projectExists = await prisma.projects.findUnique({
        where: { id: data.project_id },
      });

      if (!projectExists) {
        throw new NotFoundError('Project not found');
      }
    }

    // Validate assignee exists if provided
    if (data.assigned_to) {
      const assigneeExists = await prisma.contacts.findUnique({
        where: { id: data.assigned_to },
      });

      if (!assigneeExists) {
        throw new NotFoundError('Assignee not found');
      }
    }

    // Convert due_date to Date object if provided as string
    const taskData: any = { ...data };
    if (data.due_date) {
      taskData.due_date = new Date(data.due_date);
    }

    const task = await prisma.tasks.update({
      where: { id },
      data: {
        ...taskData,
        updated_at: new Date(),
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return task;
  }

  async deleteTask(id: string) {
    // Check if task exists
    const task = await prisma.tasks.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    await prisma.tasks.delete({
      where: { id },
    });

    return { message: 'Task deleted successfully' };
  }

  async getTaskStats(params: {
    project_id?: string;
    assigned_to?: string;
  }) {
    const where: Prisma.tasksWhereInput = {};

    if (params.project_id) {
      where.project_id = params.project_id;
    }

    if (params.assigned_to) {
      where.assigned_to = params.assigned_to;
    }

    const [statusStats, priorityStats, total, overdue] = await Promise.all([
      prisma.tasks.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      prisma.tasks.groupBy({
        by: ['priority'],
        where,
        _count: true,
      }),
      prisma.tasks.count({ where }),
      prisma.tasks.count({
        where: {
          ...where,
          due_date: {
            lt: new Date(),
          },
          status: {
            not: 'Done',
          },
        },
      }),
    ]);

    return {
      total,
      overdue,
      byStatus: statusStats.reduce((acc, stat) => {
        acc[stat.status] = stat._count;
        return acc;
      }, {} as Record<string, number>),
      byPriority: priorityStats.reduce((acc, stat) => {
        acc[stat.priority] = stat._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}

export default new TasksService();
