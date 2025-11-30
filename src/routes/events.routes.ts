import { Router } from 'express';
import eventsController from '../controllers/events.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createEventSchema,
  updateEventSchema,
  getEventSchema,
  listEventsSchema,
  updateEventStatusSchema,
  getEventConflictsSchema,
} from '../validators/events.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/events
 * @desc    Create a new event
 * @access  Private
 */
router.post(
  '/',
  validate(createEventSchema),
  eventsController.create
);

/**
 * @route   GET /api/events
 * @desc    Get all events with optional filtering
 * @access  Private
 */
router.get(
  '/',
  validate(listEventsSchema),
  eventsController.getAll
);

/**
 * @route   GET /api/events/stats
 * @desc    Get event statistics
 * @access  Private
 */
router.get('/stats', eventsController.getStats);

/**
 * @route   GET /api/events/conflicts
 * @desc    Check for event conflicts
 * @access  Private
 */
router.get(
  '/conflicts',
  validate(getEventConflictsSchema),
  eventsController.checkConflicts
);

/**
 * @route   GET /api/events/date-range
 * @desc    Get events by date range
 * @access  Private
 */
router.get('/date-range', eventsController.getByDateRange);

/**
 * @route   GET /api/events/project/:projectId
 * @desc    Get events by project ID
 * @access  Private
 */
router.get('/project/:projectId', eventsController.getByProject);

/**
 * @route   GET /api/events/:id
 * @desc    Get event by ID
 * @access  Private
 */
router.get(
  '/:id',
  validate(getEventSchema),
  eventsController.getById
);

/**
 * @route   PUT /api/events/:id
 * @desc    Update an event
 * @access  Private
 */
router.put(
  '/:id',
  validate(updateEventSchema),
  eventsController.update
);

/**
 * @route   PATCH /api/events/:id/status
 * @desc    Update event status
 * @access  Private
 */
router.patch(
  '/:id/status',
  validate(updateEventStatusSchema),
  eventsController.updateStatus
);

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete an event
 * @access  Private
 */
router.delete(
  '/:id',
  validate(getEventSchema),
  eventsController.delete
);

export default router;
