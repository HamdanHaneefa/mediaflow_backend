import { Router } from 'express';
import * as clientPortalController from '../controllers/client-portal.controller';
import { authenticateClient } from '../middleware/client-auth.middleware';
import { validateQuery, validateBody } from '../middleware/validation.middleware';
import {
  dashboardQuerySchema,
  projectsListSchema,
  projectCommentSchema,
  invoicesListSchema,
  proposalsListSchema,
  proposalResponseSchema,
  updateProfileSchema,
} from '../validators/client-portal.validator';
import { updateProfileSchema as authUpdateProfile } from '../validators/client-auth.validator';

const router = Router();

// All routes require authentication
router.use(authenticateClient);

/**
 * @route   GET /api/client/portal/dashboard
 * @desc    Get client dashboard with metrics
 * @access  Private (Client)
 */
router.get('/dashboard', validateQuery(dashboardQuerySchema), clientPortalController.getDashboard);

/**
 * @route   GET /api/client/portal/profile
 * @desc    Get client profile
 * @access  Private (Client)
 */
router.get('/profile', clientPortalController.getProfile);

/**
 * @route   PUT /api/client/portal/profile
 * @desc    Update client profile
 * @access  Private (Client)
 */
router.put('/profile', validateBody(authUpdateProfile), clientPortalController.updateProfile);

/**
 * @route   GET /api/client/portal/projects
 * @desc    Get all projects for client
 * @access  Private (Client)
 */
router.get('/projects', validateQuery(projectsListSchema), clientPortalController.getProjects);

/**
 * @route   GET /api/client/portal/projects/:id
 * @desc    Get single project details
 * @access  Private (Client)
 */
router.get('/projects/:id', clientPortalController.getProjectById);

/**
 * @route   POST /api/client/portal/projects/:id/comment
 * @desc    Add comment to project
 * @access  Private (Client)
 */
router.post('/projects/:id/comment', validateBody(projectCommentSchema), clientPortalController.addProjectComment);

/**
 * @route   GET /api/client/portal/invoices
 * @desc    Get all invoices for client
 * @access  Private (Client)
 */
router.get('/invoices', validateQuery(invoicesListSchema), clientPortalController.getInvoices);

/**
 * @route   GET /api/client/portal/invoices/:id
 * @desc    Get single invoice details
 * @access  Private (Client)
 */
router.get('/invoices/:id', clientPortalController.getInvoiceById);

/**
 * @route   GET /api/client/portal/proposals
 * @desc    Get all proposals for client
 * @access  Private (Client)
 */
router.get('/proposals', validateQuery(proposalsListSchema), clientPortalController.getProposals);

/**
 * @route   GET /api/client/portal/proposals/:id
 * @desc    Get single proposal details
 * @access  Private (Client)
 */
router.get('/proposals/:id', clientPortalController.getProposalById);

/**
 * @route   POST /api/client/portal/proposals/:id/respond
 * @desc    Respond to proposal (accept/reject/request changes)
 * @access  Private (Client)
 */
router.post('/proposals/:id/respond', validateBody(proposalResponseSchema), clientPortalController.respondToProposal);

/**
 * @route   GET /api/client/portal/activities
 * @desc    Get activity feed for client
 * @access  Private (Client)
 */
router.get('/activities', clientPortalController.getActivities);

export default router;
