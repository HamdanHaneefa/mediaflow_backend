import { Request, Response, NextFunction } from 'express';
import eventsService from '../services/events.service';
import { successResponse } from '../utils/response';
import { 
  CreateEventInput, 
  UpdateEventInput, 
  ListEventsQuery,
  UpdateEventStatusInput,
  GetEventConflictsQuery
} from '../validators/events.validator';

export class EventsController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data: CreateEventInput = req.body;
      const event = await eventsService.createEvent(data);
      
      return successResponse(res, event, 'Event created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const event = await eventsService.getEventById(id);
      
      return successResponse(res, event, 'Event retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('EventsController.getAll - Request query:', req.query);
      console.log('EventsController.getAll - User:', req.user);
      
      const query: ListEventsQuery = req.query as any;
      const result = await eventsService.getEvents(query);
      
      console.log('EventsController.getAll - Result:', {
        itemsCount: result.items.length,
        pagination: result.pagination
      });
      
      return successResponse(res, result, 'Events retrieved successfully');
    } catch (error) {
      console.error('EventsController.getAll - Error:', error);
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data: UpdateEventInput = req.body;
      const event = await eventsService.updateEvent(id, data);
      
      return successResponse(res, event, 'Event updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await eventsService.deleteEvent(id);
      
      return successResponse(res, null, 'Event deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status }: UpdateEventStatusInput = req.body;
      const event = await eventsService.updateEventStatus(id, status);
      
      return successResponse(res, event, 'Event status updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async checkConflicts(req: Request, res: Response, next: NextFunction) {
    try {
      const query: GetEventConflictsQuery = req.query as any;
      const conflicts = await eventsService.checkConflicts(query);
      
      return successResponse(res, conflicts, 'Event conflicts checked successfully');
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await eventsService.getEventStats();
      
      return successResponse(res, stats, 'Event statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getByProject(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const events = await eventsService.getEventsByProject(projectId);
      
      return successResponse(res, events, 'Project events retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getByDateRange(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const events = await eventsService.getEventsByDateRange(
        startDate as string, 
        endDate as string
      );
      
      return successResponse(res, events, 'Events by date range retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

const eventsController = new EventsController();
export default eventsController;
