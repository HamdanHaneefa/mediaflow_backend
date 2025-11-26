import { Router } from 'express';
import {
  getProfitLossReport,
  getCashFlowReport,
  getAccountsReceivableReport,
  getExpenseReport,
  getIncomeReport,
  getCustomReport,
} from '../controllers/reports.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateQuery, validateBody } from '../middleware/validation.middleware';
import {
  profitLossReportSchema,
  cashFlowReportSchema,
  expenseReportSchema,
  incomeReportSchema,
  customReportSchema,
} from '../validators/reports.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/reports/profit-loss
 * @desc    Generate Profit & Loss report
 * @access  Private
 */
router.get(
  '/profit-loss',
  validateQuery(profitLossReportSchema),
  getProfitLossReport
);

/**
 * @route   GET /api/reports/cash-flow
 * @desc    Generate Cash Flow report
 * @access  Private
 */
router.get(
  '/cash-flow',
  validateQuery(cashFlowReportSchema),
  getCashFlowReport
);

/**
 * @route   GET /api/reports/accounts-receivable
 * @desc    Generate Accounts Receivable Aging report
 * @access  Private
 */
router.get('/accounts-receivable', getAccountsReceivableReport);

/**
 * @route   GET /api/reports/expenses
 * @desc    Generate Expense report
 * @access  Private
 */
router.get('/expenses', validateQuery(expenseReportSchema), getExpenseReport);

/**
 * @route   GET /api/reports/income
 * @desc    Generate Income report
 * @access  Private
 */
router.get('/income', validateQuery(incomeReportSchema), getIncomeReport);

/**
 * @route   POST /api/reports/custom
 * @desc    Generate Custom report
 * @access  Private
 */
router.post('/custom', validateBody(customReportSchema), getCustomReport);

export default router;
