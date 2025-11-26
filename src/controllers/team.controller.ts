import { Request, Response, NextFunction } from 'express';
import teamService from '../services/team.service';
import { successResponse } from '../utils/response';
import {
  CreateTeamMemberInput,
  UpdateTeamMemberInput,
  AssignProjectInput,
  CreateTeamInput,
  UpdateTeamInput,
} from '../validators/team.validator';

export class TeamController {
  // Team Member Controllers
  async createMember(req: Request, res: Response, next: NextFunction) {
    try {
      const data: CreateTeamMemberInput = req.body;
      const member = await teamService.createTeamMember(data);
      
      return successResponse(res, member, 'Team member created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getMemberById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const member = await teamService.getTeamMember(id);
      
      return successResponse(res, member, 'Team member retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async listMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        page,
        limit,
        search,
        role,
        status,
        department,
        team_id,
        sortBy,
        sortOrder,
      } = req.query;

      const members = await teamService.listTeamMembers({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search as string,
        role: role as string,
        status: status as string,
        department: department as string,
        team_id: team_id as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      });

      return successResponse(res, members, 'Team members retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data: UpdateTeamMemberInput = req.body;
      const member = await teamService.updateTeamMember(id, data);
      
      return successResponse(res, member, 'Team member updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await teamService.deleteTeamMember(id);
      
      return successResponse(res, result, 'Team member deactivated successfully');
    } catch (error) {
      next(error);
    }
  }

  // Project Assignment Controllers
  async assignProject(req: Request, res: Response, next: NextFunction) {
    try {
      const data: AssignProjectInput = req.body;
      const assignment = await teamService.assignProject(data);
      
      return successResponse(res, assignment, 'Project assigned successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async removeAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await teamService.removeProjectAssignment(id);
      
      return successResponse(res, result, 'Assignment removed successfully');
    } catch (error) {
      next(error);
    }
  }

  // Team Controllers
  async createTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const data: CreateTeamInput = req.body;
      const createdBy = req.user?.id || ''; // Assuming user is attached by auth middleware
      const team = await teamService.createTeam(data, createdBy);
      
      return successResponse(res, team, 'Team created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getTeamById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const team = await teamService.getTeam(id);
      
      return successResponse(res, team, 'Team retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async listTeams(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, sortBy, sortOrder } = req.query;

      const teams = await teamService.listTeams({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      });

      return successResponse(res, teams, 'Teams retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data: UpdateTeamInput = req.body;
      const team = await teamService.updateTeam(id, data);
      
      return successResponse(res, team, 'Team updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await teamService.deleteTeam(id);
      
      return successResponse(res, result, 'Team deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new TeamController();
