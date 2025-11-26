import { Router } from 'express';
import tasksController from '../controllers/tasks.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createTaskSchema,
  updateTaskSchema,
  getTaskSchema,
  listTasksSchema,
} from '../validators/tasks.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
router.post(
  '/',
  validate(createTaskSchema),
  tasksController.create
);

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks with pagination and filters
 * @access  Private
 */
router.get(
  '/',
  validate(listTasksSchema),
  tasksController.list
);

/**
 * @route   GET /api/tasks/stats
 * @desc    Get task statistics
 * @access  Private
 */
router.get(
  '/stats',
  tasksController.getStats
);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get task by ID
 * @access  Private
 */
router.get(
  '/:id',
  validate(getTaskSchema),
  tasksController.getById
);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update task
 * @access  Private
 */
router.put(
  '/:id',
  validate(updateTaskSchema),
  tasksController.update
);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete task
 * @access  Private
 */
router.delete(
  '/:id',
  validate(getTaskSchema),
  tasksController.delete
);

export default router;
