import { Router } from 'express';
import projectsController from '../controllers/projects.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createProjectSchema,
  updateProjectSchema,
  getProjectSchema,
  listProjectsSchema,
} from '../validators/projects.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private
 */
router.post(
  '/',
  validate(createProjectSchema),
  projectsController.create
);

/**
 * @route   GET /api/projects
 * @desc    Get all projects with pagination and filters
 * @access  Private
 */
router.get(
  '/',
  validate(listProjectsSchema),
  projectsController.list
);

/**
 * @route   GET /api/projects/:id
 * @desc    Get project by ID
 * @access  Private
 */
router.get(
  '/:id',
  validate(getProjectSchema),
  projectsController.getById
);

/**
 * @route   GET /api/projects/:id/stats
 * @desc    Get project statistics
 * @access  Private
 */
router.get(
  '/:id/stats',
  validate(getProjectSchema),
  projectsController.getStats
);

/**
 * @route   PUT /api/projects/:id
 * @desc    Update project
 * @access  Private
 */
router.put(
  '/:id',
  validate(updateProjectSchema),
  projectsController.update
);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Archive project
 * @access  Private
 */
router.delete(
  '/:id',
  validate(getProjectSchema),
  projectsController.delete
);

export default router;
