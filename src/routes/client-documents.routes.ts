import { Router } from 'express';
import { authenticateClient } from '../middleware/client-auth.middleware';
import { validateQuery, validateParams } from '../middleware/validation.middleware';
import {
  getDocumentsSchema,
} from '../validators/client-extended.validator';
import {
  getDocuments,
  getDocumentById,
  deleteDocument,
  getDocumentTypes,
} from '../controllers/client-documents.controller';

const router = Router();

/**
 * @route   GET /api/client/documents
 * @desc    Get documents for authenticated client
 * @access  Private (Client)
 */
router.get(
  '/',
  authenticateClient,
  validateQuery(getDocumentsSchema),
  getDocuments
);

/**
 * @route   GET /api/client/documents/types
 * @desc    Get document types/categories
 * @access  Private (Client)
 */
router.get(
  '/types',
  authenticateClient,
  getDocumentTypes
);

/**
 * @route   GET /api/client/documents/:documentId
 * @desc    Get document by ID
 * @access  Private (Client)
 */
router.get(
  '/:documentId',
  authenticateClient,
  getDocumentById
);

/**
 * @route   DELETE /api/client/documents/:documentId
 * @desc    Delete document
 * @access  Private (Client)
 */
router.delete(
  '/:documentId',
  authenticateClient,
  deleteDocument
);

export default router;
