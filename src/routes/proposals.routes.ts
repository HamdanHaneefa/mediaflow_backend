import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createLeadSchema,
  updateLeadSchema,
  convertLeadSchema,
  listLeadsSchema,
  createProposalSchema,
  updateProposalSchema,
  updateProposalStatusSchema,
  listProposalsSchema,
  sendProposalSchema,
  signProposalSchema,
  trackProposalViewSchema,
} from '../validators/proposals.validator';
import {
  createLead,
  listLeads,
  getLead,
  updateLead,
  deleteLead,
  convertLead,
  getLeadStats,
  createProposal,
  listProposals,
  getProposal,
  updateProposal,
  updateProposalStatus,
  deleteProposal,
  generateProposalPDF,
  sendProposal,
  getProposalStats,
  viewPublicProposal,
  signProposal,
  trackProposalView,
} from '../controllers/proposals.controller';

const router = Router();

// ==================== LEADS ROUTES ====================

/**
 * @route   POST /api/proposals/leads
 * @desc    Create a new lead
 * @access  Private
 */
router.post('/leads', authenticate, validate(createLeadSchema), createLead);

/**
 * @route   GET /api/proposals/leads
 * @desc    Get all leads with filtering and pagination
 * @access  Private
 */
router.get('/leads', authenticate, validate(listLeadsSchema), listLeads);

/**
 * @route   GET /api/proposals/leads/stats
 * @desc    Get lead statistics
 * @access  Private
 */
router.get('/leads/stats', authenticate, getLeadStats);

/**
 * @route   GET /api/proposals/leads/:id
 * @desc    Get a single lead by ID
 * @access  Private
 */
router.get('/leads/:id', authenticate, getLead);

/**
 * @route   PUT /api/proposals/leads/:id
 * @desc    Update a lead
 * @access  Private
 */
router.put('/leads/:id', authenticate, validate(updateLeadSchema), updateLead);

/**
 * @route   DELETE /api/proposals/leads/:id
 * @desc    Delete a lead
 * @access  Private
 */
router.delete('/leads/:id', authenticate, deleteLead);

/**
 * @route   POST /api/proposals/leads/:id/convert
 * @desc    Convert a lead to a client
 * @access  Private
 */
router.post(
  '/leads/:id/convert',
  authenticate,
  validate(convertLeadSchema),
  convertLead
);

// ==================== PROPOSALS ROUTES ====================

/**
 * @route   POST /api/proposals
 * @desc    Create a new proposal
 * @access  Private
 */
router.post('/', authenticate, validate(createProposalSchema), createProposal);

/**
 * @route   GET /api/proposals
 * @desc    Get all proposals with filtering and pagination
 * @access  Private
 */
router.get('/', authenticate, validate(listProposalsSchema), listProposals);

/**
 * @route   GET /api/proposals/stats
 * @desc    Get proposal statistics
 * @access  Private
 */
router.get('/stats', authenticate, getProposalStats);

/**
 * @route   GET /api/proposals/:id
 * @desc    Get a single proposal by ID
 * @access  Private
 */
router.get('/:id', authenticate, getProposal);

/**
 * @route   PUT /api/proposals/:id
 * @desc    Update a proposal
 * @access  Private
 */
router.put('/:id', authenticate, validate(updateProposalSchema), updateProposal);

/**
 * @route   PATCH /api/proposals/:id/status
 * @desc    Update proposal status
 * @access  Private
 */
router.patch(
  '/:id/status',
  authenticate,
  validate(updateProposalStatusSchema),
  updateProposalStatus
);

/**
 * @route   DELETE /api/proposals/:id
 * @desc    Delete a proposal
 * @access  Private
 */
router.delete('/:id', authenticate, deleteProposal);

/**
 * @route   POST /api/proposals/:id/pdf
 * @desc    Generate PDF for a proposal
 * @access  Private
 */
router.post('/:id/pdf', authenticate, generateProposalPDF);

/**
 * @route   POST /api/proposals/:id/send
 * @desc    Send proposal via email
 * @access  Private
 */
router.post('/:id/send', authenticate, validate(sendProposalSchema), sendProposal);

// ==================== PUBLIC ROUTES ====================

/**
 * @route   GET /api/proposals/public/:token
 * @desc    View a proposal using public token (no auth required)
 * @access  Public
 */
router.get('/public/:token', viewPublicProposal);

/**
 * @route   POST /api/proposals/public/:token/sign
 * @desc    Sign a proposal using public token (no auth required)
 * @access  Public
 */
router.post(
  '/public/:token/sign',
  validate(signProposalSchema),
  signProposal
);

/**
 * @route   POST /api/proposals/public/:token/track
 * @desc    Track proposal view (no auth required)
 * @access  Public
 */
router.post(
  '/public/:token/track',
  validate(trackProposalViewSchema),
  trackProposalView
);

export default router;
