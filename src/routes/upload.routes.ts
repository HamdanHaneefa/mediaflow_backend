import { Router } from 'express';
import uploadController from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth.middleware';
import {
  uploadImage,
  uploadDocument,
  uploadVideo,
  uploadAvatar,
  uploadReceipt,
  uploadAny,
} from '../middleware/upload.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/upload/image
 * @desc    Upload a single image
 * @access  Private
 */
router.post(
  '/image',
  uploadImage.single('file'),
  uploadController.uploadImage
);

/**
 * @route   POST /api/upload/images
 * @desc    Upload multiple images
 * @access  Private
 */
router.post(
  '/images',
  uploadImage.array('files', 10),
  uploadController.uploadMultiple
);

/**
 * @route   POST /api/upload/document
 * @desc    Upload a single document
 * @access  Private
 */
router.post(
  '/document',
  uploadDocument.single('file'),
  uploadController.uploadDocument
);

/**
 * @route   POST /api/upload/documents
 * @desc    Upload multiple documents
 * @access  Private
 */
router.post(
  '/documents',
  uploadDocument.array('files', 10),
  uploadController.uploadMultiple
);

/**
 * @route   POST /api/upload/video
 * @desc    Upload a single video
 * @access  Private
 */
router.post(
  '/video',
  uploadVideo.single('file'),
  uploadController.uploadVideo
);

/**
 * @route   POST /api/upload/avatar
 * @desc    Upload an avatar image
 * @access  Private
 */
router.post(
  '/avatar',
  uploadAvatar.single('file'),
  uploadController.uploadAvatar
);

/**
 * @route   POST /api/upload/receipt
 * @desc    Upload a receipt image
 * @access  Private
 */
router.post(
  '/receipt',
  uploadReceipt.single('file'),
  uploadController.uploadReceipt
);

/**
 * @route   POST /api/upload/any
 * @desc    Upload any type of file
 * @access  Private
 */
router.post(
  '/any',
  uploadAny.single('file'),
  uploadController.uploadSingle
);

export default router;
