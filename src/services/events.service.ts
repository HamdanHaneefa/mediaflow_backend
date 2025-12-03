// @ts-nocheck
import { Prisma, PrismaClient } from '@prisma/client';
import { ConflictError, NotFoundError, ValidationError } from '../utils/errors';
import { paginate, PaginatedResult } from '../utils/pagination';
import { CreateEventInput, GetEventConflictsQuery, ListEventsQuery, UpdateEventInput } from '../validators/events.validator';

const prisma = new PrismaClient();

// Helper function to transform event data to match frontend expectations
function transformEvent(event: any) {
  if (!event) return event;
  
  return {
    ...event,
    event_type: event.type, // Map 'type' to 'event_type' for frontend compatibility
    start_time: event.start_time?.toISOString(),
    end_time: event.end_time?.toISOString(),
    created_at: event.created_at?.toISOString(),
    updated_at: event.updated_at?.toISOString(),
    // The relationship is named 'project' not 'projects'
    projects: event.project // Map 'project' to 'projects' for frontend compatibility
  };
}

export class EventsService {
  async createEvent(data: CreateEventInput): Promise<any> {
    try {
      // Validate time constraints
      const startTime = new Date(data.start_time);
      const endTime = new Date(data.end_time);
      
      if (startTime >= endTime) {
        throw new ValidationError('End time must be after start time');
      }

      // Check for conflicts if attendees are specified
      if (data.attendees && data.attendees.length > 0) {
        const conflicts = await this.checkConflicts({
          start_time: data.start_time,
          end_time: data.end_time,
          attendees: data.attendees // Keep as array for conflict checking
        });
        
        if (conflicts.length > 0) {
          throw new ConflictError(`Event conflicts found with ${conflicts.length} existing events`);
        }
      }

      // Validate project exists if project_id is provided
      if (data.project_id) {
        const project = await prisma.projects.findUnique({
          where: { id: data.project_id }
        });
        
        if (!project) {
          throw new NotFoundError('Project not found');
        }
      }

      const eventData = {
        title: data.title,
        description: data.description,
        type: data.type || 'Meeting',
        start_time: new Date(data.start_time),
        end_time: new Date(data.end_time),
        location: data.location,
        project_id: data.project_id,
        attendees: data.attendees || [],
        color: data.color,
        is_all_day: data.is_all_day || false,
        recurrence: data.recurrence || undefined,
        reminder: data.reminder || undefined,
        status: data.status || 'Scheduled'
      };

      const event = await prisma.events.create({
        data: eventData,
        include: {
          projects: {
            select: {
              id: true,
              name: true,
              status: true
            }
          }
        }
      });

      return transformEvent(event);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictError('Event with this title already exists at this time');
        }
        if (error.code === 'P2025') {
          throw new NotFoundError('Related record not found');
        }
      }
      throw error;
    }
  }

  async getEventById(id: string): Promise<any> {
    const event = await prisma.events.findUnique({
      where: { id },
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      }
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    return transformEvent(event);
  }

  async getEvents(query: ListEventsQuery): Promise<PaginatedResult<any>> {
    try {
      console.log('EventsService.getEvents - Query:', query);
      
      const {
        page = 1,
        limit = 10,
        search,
        project_id,
        status,
        type,
        start_date,
        end_date,
        attendee_id
      } = query;

      // Build where clause
      const where: Prisma.eventsWhereInput = {};

      // Search in title and description
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Filter by project
      if (project_id) {
        where.project_id = project_id;
      }

      // Filter by status
      if (status) {
        where.status = status;
      }

      // Filter by type
      if (type) {
        where.type = type;
      }

      // Filter by date range
      if (start_date && end_date) {
        where.AND = [
          { start_time: { gte: new Date(start_date) } },
          { end_time: { lte: new Date(end_date) } }
        ];
      } else if (start_date) {
        where.start_time = { gte: new Date(start_date) };
      } else if (end_date) {
        where.end_time = { lte: new Date(end_date) };
      }

      // Filter by attendee
      if (attendee_id) {
        where.attendees = {
          has: attendee_id
        };
      }

      console.log('EventsService.getEvents - Where clause:', JSON.stringify(where, null, 2));

      const result = await paginate(
        prisma.events,
        { page, limit },
        {
          where,
          include: {
            projects: {
              select: {
                id: true,
                name: true,
                status: true
              }
            }
          },
          orderBy: { start_time: 'asc' }
        }
      );

      console.log('EventsService.getEvents - Raw result:', {
        totalItems: result.items.length,
        pagination: result.pagination
      });

      const transformedItems = result.items.map(transformEvent);
      console.log('EventsService.getEvents - Transformed items:', transformedItems.length);

      return {
        ...result,
        items: transformedItems
      };
    } catch (error) {
      console.error('EventsService.getEvents - Error:', error);
      throw error;
    }
  }

  async updateEvent(id: string, data: UpdateEventInput): Promise<any> {
    try {
      // Check if event exists
      const existingEvent = await prisma.events.findUnique({
        where: { id }
      });

      if (!existingEvent) {
        throw new NotFoundError('Event not found');
      }

      // Validate time constraints if both times are provided
      if (data.start_time && data.end_time) {
        const startTime = new Date(data.start_time);
        const endTime = new Date(data.end_time);
        
        if (startTime >= endTime) {
          throw new ValidationError('End time must be after start time');
        }
      }

      // Validate project exists if project_id is provided
      if (data.project_id !== undefined) {
        if (data.project_id) {
          const project = await prisma.projects.findUnique({
            where: { id: data.project_id }
          });
          
          if (!project) {
            throw new NotFoundError('Project not found');
          }
        }
      }

      // Check for conflicts if attendees or time is being updated
      if (data.attendees || data.start_time || data.end_time) {
        const startTime = data.start_time || existingEvent.start_time.toISOString();
        const endTime = data.end_time || existingEvent.end_time.toISOString();
        const attendees = data.attendees || existingEvent.attendees;
        
        if (attendees && attendees.length > 0) {
          const conflicts = await this.checkConflicts({
            start_time: startTime,
            end_time: endTime,
            attendees: attendees, // Keep as array
            exclude_event_id: id
          });
          
          if (conflicts.length > 0) {
            throw new ConflictError(`Event conflicts found with ${conflicts.length} existing events`);
          }
        }
      }

      const updateData: any = {};
      
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.start_time !== undefined) updateData.start_time = new Date(data.start_time);
      if (data.end_time !== undefined) updateData.end_time = new Date(data.end_time);
      if (data.location !== undefined) updateData.location = data.location;
      if (data.project_id !== undefined) updateData.project_id = data.project_id;
      if (data.attendees !== undefined) updateData.attendees = data.attendees;
      if (data.color !== undefined) updateData.color = data.color;
      if (data.is_all_day !== undefined) updateData.is_all_day = data.is_all_day;
      if (data.status !== undefined) updateData.status = data.status;
      
      if (data.recurrence !== undefined) {
        updateData.recurrence = data.recurrence ? JSON.stringify(data.recurrence) : null;
      }
      if (data.reminder !== undefined) {
        updateData.reminder = data.reminder ? JSON.stringify(data.reminder) : null;
      }

      const event = await prisma.events.update({
        where: { id },
        data: updateData,
        include: {
          projects: {
            select: {
              id: true,
              name: true,
              status: true
            }
          }
        }
      });

      return transformEvent(event);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundError('Event not found');
        }
      }
      throw error;
    }
  }

  async deleteEvent(id: string): Promise<void> {
    try {
      await prisma.events.delete({
        where: { id }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundError('Event not found');
        }
      }
      throw error;
    }
  }

  async updateEventStatus(id: string, status: string): Promise<any> {
    try {
      const event = await prisma.events.update({
        where: { id },
        data: { status },
        include: {
          projects: {
            select: {
              id: true,
              name: true,
              status: true
            }
          }
        }
      });

      return transformEvent(event);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundError('Event not found');
        }
      }
      throw error;
    }
  }

  async checkConflicts(query: GetEventConflictsQuery): Promise<any[]> {
    const { start_time, end_time, attendees, exclude_event_id } = query;
    
    if (!attendees) {
      return [];
    }

    // Handle both string array from frontend and comma-separated string from API
    const attendeeIds = Array.isArray(attendees) 
      ? attendees.filter(Boolean)
      : attendees.split(',').filter(Boolean);
      
    if (attendeeIds.length === 0) {
      return [];
    }

    const where: Prisma.eventsWhereInput = {
      AND: [
        {
          OR: [
            // Event starts during the time range
            {
              AND: [
                { start_time: { gte: new Date(start_time) } },
                { start_time: { lt: new Date(end_time) } }
              ]
            },
            // Event ends during the time range
            {
              AND: [
                { end_time: { gt: new Date(start_time) } },
                { end_time: { lte: new Date(end_time) } }
              ]
            },
            // Event encompasses the entire time range
            {
              AND: [
                { start_time: { lte: new Date(start_time) } },
                { end_time: { gte: new Date(end_time) } }
              ]
            }
          ]
        },
        {
          // Check for any overlapping attendees
          attendees: {
            hasSome: attendeeIds
          }
        }
      ]
    };

    // Exclude the current event if updating
    if (exclude_event_id) {
      where.NOT = { id: exclude_event_id };
    }

    const conflicts = await prisma.events.findMany({
      where,
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      },
      orderBy: { start_time: 'asc' }
    });

    return conflicts.map(transformEvent);
  }

  async getEventStats(): Promise<any> {
    const [
      totalEvents,
      scheduledEvents,
      inProgressEvents,
      completedEvents,
      cancelledEvents,
      recentEvents
    ] = await Promise.all([
      prisma.events.count(),
      prisma.events.count({ where: { status: 'Scheduled' } }),
      prisma.events.count({ where: { status: 'In Progress' } }),
      prisma.events.count({ where: { status: 'Completed' } }),
      prisma.events.count({ where: { status: 'Cancelled' } }),
      prisma.events.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        include: {
          projects: {
            select: {
              id: true,
              name: true,
              status: true
            }
          }
        }
      })
    ]);

    return {
      total: totalEvents,
      scheduled: scheduledEvents,
      in_progress: inProgressEvents,
      completed: completedEvents,
      cancelled: cancelledEvents,
      recent: recentEvents.map(transformEvent)
    };
  }

  async getEventsByProject(projectId: string): Promise<any[]> {
    const events = await prisma.events.findMany({
      where: { project_id: projectId },
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      },
      orderBy: { start_time: 'asc' }
    });

    return events.map(transformEvent);
  }

  async getEventsByDateRange(startDate: string, endDate: string): Promise<any[]> {
    const events = await prisma.events.findMany({
      where: {
        AND: [
          { start_time: { gte: new Date(startDate) } },
          { end_time: { lte: new Date(endDate) } }
        ]
      },
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      },
      orderBy: { start_time: 'asc' }
    });

    return events.map(transformEvent);
  }
}

const eventsService = new EventsService();
export default eventsService;
