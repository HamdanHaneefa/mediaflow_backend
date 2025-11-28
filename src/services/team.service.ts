import { PrismaClient, Prisma } from '@prisma/client';
import {
  CreateTeamMemberInput,
  UpdateTeamMemberInput,
  AssignProjectInput,
  CreateTeamInput,
  UpdateTeamInput,
} from '../validators/team.validator';
import { NotFoundError, ConflictError } from '../utils/errors';
import { paginate, PaginatedResult } from '../utils/pagination';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export class TeamService {
  // Team Member Operations
  async createTeamMember(data: CreateTeamMemberInput) {
    // Check if email already exists
    const existingMember = await prisma.team_members.findUnique({
      where: { email: data.email },
    });

    if (existingMember) {
      throw new ConflictError('Team member with this email already exists');
    }

    // Validate team exists if provided
    if (data.team_id) {
      const teamExists = await prisma.teams.findUnique({
        where: { id: data.team_id },
      });

      if (!teamExists) {
        throw new NotFoundError('Team not found');
      }
    }

    // Convert hire_date to Date object if provided as string
    const memberData: any = { ...data };
    if (data.hire_date) {
      memberData.hire_date = new Date(data.hire_date);
    }

    // Generate a temporary password (should be changed on first login)
    const tempPassword = Math.random().toString(36).slice(-12);
    memberData.password = await bcrypt.hash(tempPassword, 10);

    const member = await prisma.team_members.create({
      data: {
        ...memberData,
        updated_at: new Date(),
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    // Don't return password
    const { password, ...memberWithoutPassword } = member;

    return {
      ...memberWithoutPassword,
      tempPassword, // Return temp password only on creation
    };
  }

  async getTeamMember(id: string) {
    const member = await prisma.team_members.findUnique({
      where: { id },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        project_assignments: {
          select: {
            id: true,
            role_in_project: true,
            is_lead: true,
            assigned_at: true,
            project: {
              select: {
                id: true,
                title: true,
                status: true,
                phase: true,
              },
            },
          },
          orderBy: { assigned_at: 'desc' },
        },
        managed_teams: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    if (!member) {
      throw new NotFoundError('Team member not found');
    }

    // Don't return password
    const { password, ...memberWithoutPassword } = member;
    return memberWithoutPassword;
  }

  async listTeamMembers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    department?: string;
    team_id?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResult<any>> {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      status,
      department,
      team_id,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = params;

    const where: Prisma.team_membersWhereInput = {};

    if (search) {
      where.OR = [
        { first_name: { contains: search, mode: 'insensitive' } },
        { last_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    if (department) {
      where.department = department;
    }

    if (team_id) {
      where.team_id = team_id;
    }

    const orderBy: Prisma.team_membersOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const result = await paginate(
      prisma.team_members,
      { page, limit },
      {
        where,
        orderBy,
        include: {
          team: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              project_assignments: true,
              managed_teams: true,
            },
          },
        },
      }
    );

    // Remove passwords from results
    result.items = result.items.map((member: any) => {
      const { password, ...memberWithoutPassword } = member;
      return memberWithoutPassword;
    });

    return result;
  }

  async updateTeamMember(id: string, data: UpdateTeamMemberInput & { is_active?: boolean }) {
    // Check if member exists
    const existingMember = await prisma.team_members.findUnique({
      where: { id },
    });

    if (!existingMember) {
      throw new NotFoundError('Team member not found');
    }

    // If email is being updated, check if new email already exists
    if (data.email && data.email !== existingMember.email) {
      const emailExists = await prisma.team_members.findUnique({
        where: { email: data.email },
      });

      if (emailExists) {
        throw new ConflictError('Team member with this email already exists');
      }
    }

    // Validate team exists if provided
    if (data.team_id) {
      const teamExists = await prisma.teams.findUnique({
        where: { id: data.team_id },
      });

      if (!teamExists) {
        throw new NotFoundError('Team not found');
      }
    }

    // Transform is_active to status if provided
    const updateData: any = { ...data };
    if ('is_active' in data) {
      updateData.status = data.is_active ? 'active' : 'inactive';
      delete updateData.is_active;
    }

    const member = await prisma.team_members.update({
      where: { id },
      data: {
        ...updateData,
        updated_at: new Date(),
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Don't return password
    const { password, ...memberWithoutPassword } = member;
    return memberWithoutPassword;
  }

  async deleteTeamMember(id: string) {
    // Check if member exists
    const member = await prisma.team_members.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            project_assignments: true,
            managed_teams: true,
          },
        },
      },
    });

    if (!member) {
      throw new NotFoundError('Team member not found');
    }

    // Check if member has active assignments
    if (member._count.project_assignments > 0) {
      throw new ConflictError(
        `Cannot delete team member with ${member._count.project_assignments} active project assignment(s). Please reassign projects first.`
      );
    }

    if (member._count.managed_teams > 0) {
      throw new ConflictError(
        `Cannot delete team member who manages ${member._count.managed_teams} team(s). Please reassign team management first.`
      );
    }

    // Soft delete by updating status
    await prisma.team_members.update({
      where: { id },
      data: {
        status: 'inactive',
        updated_at: new Date(),
      },
    });

    return { message: 'Team member deactivated successfully' };
  }

  // Project Assignment Operations
  async assignProject(data: AssignProjectInput) {
    // Validate project exists
    const projectExists = await prisma.projects.findUnique({
      where: { id: data.project_id },
    });

    if (!projectExists) {
      throw new NotFoundError('Project not found');
    }

    // Validate team member exists
    const memberExists = await prisma.team_members.findUnique({
      where: { id: data.team_member_id },
    });

    if (!memberExists) {
      throw new NotFoundError('Team member not found');
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.project_assignments.findFirst({
      where: {
        project_id: data.project_id,
        team_member_id: data.team_member_id,
      },
    });

    if (existingAssignment) {
      throw new ConflictError('Team member is already assigned to this project');
    }

    const assignment = await prisma.project_assignments.create({
      data: {
        ...data,
        assigned_at: new Date(),
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
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
    });

    return assignment;
  }

  async removeProjectAssignment(assignmentId: string) {
    const assignment = await prisma.project_assignments.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new NotFoundError('Assignment not found');
    }

    await prisma.project_assignments.delete({
      where: { id: assignmentId },
    });

    return { message: 'Project assignment removed successfully' };
  }

  // Team Operations
  async createTeam(data: CreateTeamInput, createdBy: string) {
    // Validate manager exists if provided
    if (data.manager_id) {
      const managerExists = await prisma.team_members.findUnique({
        where: { id: data.manager_id },
      });

      if (!managerExists) {
        throw new NotFoundError('Manager not found');
      }
    }

    const team = await prisma.teams.create({
      data: {
        ...data,
        created_by: createdBy,
        updated_at: new Date(),
      },
      include: {
        manager: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        _count: {
          select: {
            members: true,
            team_project_assignments: true,
          },
        },
      },
    });

    return team;
  }

  async getTeam(id: string) {
    const team = await prisma.teams.findUnique({
      where: { id },
      include: {
        manager: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            position: true,
          },
        },
        members: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            position: true,
            status: true,
            avatar_url: true,
          },
        },
        team_project_assignments: {
          select: {
            project: {
              select: {
                id: true,
                title: true,
                status: true,
                phase: true,
              },
            },
            assigned_at: true,
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundError('Team not found');
    }

    return team;
  }

  async listTeams(params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResult<any>> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = params;

    const where: Prisma.teamsWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.teamsOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    return paginate(
      prisma.teams,
      { page, limit },
      {
        where,
        orderBy,
        include: {
          manager: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          _count: {
            select: {
              members: true,
              team_project_assignments: true,
            },
          },
        },
      }
    );
  }

  async updateTeam(id: string, data: UpdateTeamInput) {
    // Check if team exists
    const existingTeam = await prisma.teams.findUnique({
      where: { id },
    });

    if (!existingTeam) {
      throw new NotFoundError('Team not found');
    }

    // Validate manager exists if provided
    if (data.manager_id) {
      const managerExists = await prisma.team_members.findUnique({
        where: { id: data.manager_id },
      });

      if (!managerExists) {
        throw new NotFoundError('Manager not found');
      }
    }

    const team = await prisma.teams.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
      include: {
        manager: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        _count: {
          select: {
            members: true,
            team_project_assignments: true,
          },
        },
      },
    });

    return team;
  }

  async deleteTeam(id: string) {
    // Check if team exists
    const team = await prisma.teams.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            members: true,
            team_project_assignments: true,
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundError('Team not found');
    }

    if (team._count.members > 0) {
      throw new ConflictError(
        `Cannot delete team with ${team._count.members} member(s). Please remove members first.`
      );
    }

    await prisma.teams.delete({
      where: { id },
    });

    return { message: 'Team deleted successfully' };
  }
}

export default new TeamService();
