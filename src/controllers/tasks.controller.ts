import { Request, Response, NextFunction } from 'express';
import tasksService from '../services/tasks.service';
import { successResponse } from '../utils/response';
import { CreateTaskInput, UpdateTaskInput } from '../validators/tasks.validator';

export class TasksController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data: CreateTaskInput = req.body;
      const task = await tasksService.createTask(data);
      
      return successResponse(res, task, 'Task created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const task = await tasksService.getTask(id);
      
      return successResponse(res, task, 'Task retrieved successfully');
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
        priority,
        project_id,
        assigned_to,
        sortBy,
        sortOrder,
      } = req.query;

      const tasks = await tasksService.listTasks({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search as string,
        status: status as string,
        priority: priority as string,
        project_id: project_id as string,
        assigned_to: assigned_to as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      });

      return successResponse(res, tasks, 'Tasks retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data: UpdateTaskInput = req.body;
      const task = await tasksService.updateTask(id, data);
      
      return successResponse(res, task, 'Task updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await tasksService.deleteTask(id);
      
      return successResponse(res, result, 'Task deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { project_id, assigned_to } = req.query;
      
      const stats = await tasksService.getTaskStats({
        project_id: project_id as string,
        assigned_to: assigned_to as string,
      });
      
      return successResponse(res, stats, 'Task stats retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new TasksController();
