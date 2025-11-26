import { Router } from 'express';
import teamController from '../controllers/team.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createTeamMemberSchema,
  updateTeamMemberSchema,
  getTeamMemberSchema,
  listTeamMembersSchema,
  assignProjectSchema,
  createTeamSchema,
  updateTeamSchema,
} from '../validators/team.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ============================================================================
// TEAM MEMBER ROUTES
// ============================================================================

/**
 * @route   POST /api/team/members
 * @desc    Create a new team member
 * @access  Private (Admin/Manager)
 */
router.post(
  '/members',
  validate(createTeamMemberSchema),
  teamController.createMember
);

/**
 * @route   GET /api/team/members
 * @desc    Get all team members with pagination and filters
 * @access  Private
 */
router.get(
  '/members',
  validate(listTeamMembersSchema),
  teamController.listMembers
);

/**
 * @route   GET /api/team/members/:id
 * @desc    Get team member by ID
 * @access  Private
 */
router.get(
  '/members/:id',
  validate(getTeamMemberSchema),
  teamController.getMemberById
);

/**
 * @route   PUT /api/team/members/:id
 * @desc    Update team member
 * @access  Private (Admin/Manager)
 */
router.put(
  '/members/:id',
  validate(updateTeamMemberSchema),
  teamController.updateMember
);

/**
 * @route   DELETE /api/team/members/:id
 * @desc    Deactivate team member
 * @access  Private (Admin)
 */
router.delete(
  '/members/:id',
  validate(getTeamMemberSchema),
  teamController.deleteMember
);

// ============================================================================
// PROJECT ASSIGNMENT ROUTES
// ============================================================================

/**
 * @route   POST /api/team/assignments
 * @desc    Assign a team member to a project
 * @access  Private (Admin/Manager)
 */
router.post(
  '/assignments',
  validate(assignProjectSchema),
  teamController.assignProject
);

/**
 * @route   DELETE /api/team/assignments/:id
 * @desc    Remove a project assignment
 * @access  Private (Admin/Manager)
 */
router.delete(
  '/assignments/:id',
  validate(getTeamMemberSchema),
  teamController.removeAssignment
);

// ============================================================================
// TEAM ROUTES
// ============================================================================

/**
 * @route   POST /api/team
 * @desc    Create a new team
 * @access  Private (Admin/Manager)
 */
router.post(
  '/',
  validate(createTeamSchema),
  teamController.createTeam
);

/**
 * @route   GET /api/team
 * @desc    Get all teams with pagination
 * @access  Private
 */
router.get(
  '/',
  teamController.listTeams
);

/**
 * @route   GET /api/team/:id
 * @desc    Get team by ID
 * @access  Private
 */
router.get(
  '/:id',
  validate(getTeamMemberSchema),
  teamController.getTeamById
);

/**
 * @route   PUT /api/team/:id
 * @desc    Update team
 * @access  Private (Admin/Manager)
 */
router.put(
  '/:id',
  validate(updateTeamSchema),
  teamController.updateTeam
);

/**
 * @route   DELETE /api/team/:id
 * @desc    Delete team
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  validate(getTeamMemberSchema),
  teamController.deleteTeam
);

export default router;
