import { z } from 'zod';

export const createEventSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
    description: z.string().optional(),
    type: z.string().default('Meeting'),
    start_time: z.string().datetime('Invalid start time format'),
    end_time: z.string().datetime('Invalid end time format'),
    location: z.string().optional(),
    project_id: z.string().uuid('Invalid project ID').optional(),
    attendees: z.array(z.string().uuid('Invalid attendee ID')).default([]),
    color: z.string().optional(),
    is_all_day: z.boolean().default(false),
    recurrence: z.any().optional(),
    reminder: z.any().optional(),
    status: z.enum(['Scheduled', 'In Progress', 'Completed', 'Cancelled']).default('Scheduled')
  }).refine(
    (data) => new Date(data.start_time) < new Date(data.end_time),
    {
      message: 'End time must be after start time',
      path: ['end_time']
    }
  )
});

export const updateEventSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title too long').optional(),
    description: z.string().optional(),
    type: z.string().optional(),
    start_time: z.string().datetime('Invalid start time format').optional(),
    end_time: z.string().datetime('Invalid end time format').optional(),
    location: z.string().optional(),
    project_id: z.string().uuid('Invalid project ID').optional().nullable(),
    attendees: z.array(z.string().uuid('Invalid attendee ID')).optional(),
    color: z.string().optional(),
    is_all_day: z.boolean().optional(),
    recurrence: z.any().optional(),
    reminder: z.any().optional(),
    status: z.enum(['Scheduled', 'In Progress', 'Completed', 'Cancelled']).optional()
  }).refine(
    (data) => {
      if (data.start_time && data.end_time) {
        return new Date(data.start_time) < new Date(data.end_time);
      }
      return true;
    },
    {
      message: 'End time must be after start time',
      path: ['end_time']
    }
  )
});

export const getEventSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid event ID')
  })
});

export const listEventsSchema = z.object({
  query: z.object({
    page: z.string().optional().default('1').transform(Number),
    limit: z.string().optional().default('10').transform(Number),
    search: z.string().optional(),
    project_id: z.string().uuid('Invalid project ID').optional(),
    status: z.enum(['Scheduled', 'In Progress', 'Completed', 'Cancelled']).optional(),
    type: z.string().optional(),
    start_date: z.string().datetime('Invalid start date').optional(),
    end_date: z.string().datetime('Invalid end date').optional(),
    attendee_id: z.string().uuid('Invalid attendee ID').optional()
  })
});

export const updateEventStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid event ID')
  }),
  body: z.object({
    status: z.enum(['Scheduled', 'In Progress', 'Completed', 'Cancelled'])
  })
});

export const getEventConflictsSchema = z.object({
  query: z.object({
    start_time: z.string().datetime('Invalid start time'),
    end_time: z.string().datetime('Invalid end time'),
    attendees: z.string().transform((val) => val.split(',').filter(Boolean)).optional(),
    exclude_event_id: z.string().uuid('Invalid event ID').optional()
  })
});

export type CreateEventInput = z.infer<typeof createEventSchema>['body'];
export type UpdateEventInput = z.infer<typeof updateEventSchema>['body'];
export type ListEventsQuery = z.infer<typeof listEventsSchema>['query'];
export type UpdateEventStatusInput = z.infer<typeof updateEventStatusSchema>['body'];
export type GetEventConflictsQuery = z.infer<typeof getEventConflictsSchema>['query'];
