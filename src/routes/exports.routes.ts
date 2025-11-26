import { Router } from 'express';
import {
  exportToCSV,
  exportToExcel,
  batchExport,
} from '../controllers/exports.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import {
  csvExportSchema,
  excelExportSchema,
  batchExportSchema,
} from '../validators/exports.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/exports/csv
 * @desc    Export data to CSV format
 * @access  Private
 */
router.post('/csv', validateBody(csvExportSchema), exportToCSV);

/**
 * @route   POST /api/exports/excel
 * @desc    Export data to Excel format
 * @access  Private
 */
router.post('/excel', validateBody(excelExportSchema), exportToExcel);

/**
 * @route   POST /api/exports/batch
 * @desc    Batch export multiple data sources
 * @access  Private
 */
router.post('/batch', validateBody(batchExportSchema), batchExport);

export default router;
