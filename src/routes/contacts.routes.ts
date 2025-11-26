import { Router } from 'express';
import contactsController from '../controllers/contacts.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createContactSchema,
  updateContactSchema,
  getContactSchema,
  listContactsSchema,
} from '../validators/contacts.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/contacts
 * @desc    Create a new contact
 * @access  Private
 */
router.post(
  '/',
  validate(createContactSchema),
  contactsController.create
);

/**
 * @route   GET /api/contacts
 * @desc    Get all contacts with pagination and filters
 * @access  Private
 */
router.get(
  '/',
  validate(listContactsSchema),
  contactsController.list
);

/**
 * @route   GET /api/contacts/:id
 * @desc    Get contact by ID
 * @access  Private
 */
router.get(
  '/:id',
  validate(getContactSchema),
  contactsController.getById
);

/**
 * @route   GET /api/contacts/:id/stats
 * @desc    Get contact statistics
 * @access  Private
 */
router.get(
  '/:id/stats',
  validate(getContactSchema),
  contactsController.getStats
);

/**
 * @route   PUT /api/contacts/:id
 * @desc    Update contact
 * @access  Private
 */
router.put(
  '/:id',
  validate(updateContactSchema),
  contactsController.update
);

/**
 * @route   DELETE /api/contacts/:id
 * @desc    Delete contact
 * @access  Private
 */
router.delete(
  '/:id',
  validate(getContactSchema),
  contactsController.delete
);

export default router;
