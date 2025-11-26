import { Request, Response, NextFunction } from 'express';
import projectsService from '../services/projects.service';
import { successResponse } from '../utils/response';
import { CreateProjectInput, UpdateProjectInput } from '../validators/projects.validator';

export class ProjectsController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data: CreateProjectInput = req.body;
      const project = await projectsService.createProject(data);
      
      return successResponse(res, project, 'Project created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const project = await projectsService.getProject(id);
      
      return successResponse(res, project, 'Project retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        page,
        limit,
        search,
        status,
        phase,
        client_id,
        sortBy,
        sortOrder,
      } = req.query;

      const projects = await projectsService.listProjects({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search as string,
        status: status as string,
        phase: phase as string,
        client_id: client_id as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      });

      return successResponse(res, projects, 'Projects retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data: UpdateProjectInput = req.body;
      const project = await projectsService.updateProject(id, data);
      
      return successResponse(res, project, 'Project updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await projectsService.deleteProject(id);
      
      return successResponse(res, result, 'Project archived successfully');
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const stats = await projectsService.getProjectStats(id);
      
      return successResponse(res, stats, 'Project stats retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new ProjectsController();
