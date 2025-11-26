import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createExpenseSchema,
  updateExpenseSchema,
  approveExpenseSchema,
  listExpensesSchema,
  createIncomeSchema,
  updateIncomeSchema,
  listIncomesSchema,
  createInvoiceSchema,
  updateInvoiceSchema,
  listInvoicesSchema,
  sendInvoiceSchema,
  financialReportSchema,
} from '../validators/accounting.validator';
import {
  createExpense,
  listExpenses,
  getExpense,
  updateExpense,
  approveExpense,
  deleteExpense,
  getExpenseStats,
  createIncome,
  listIncomes,
  getIncome,
  updateIncome,
  deleteIncome,
  getIncomeStats,
  createInvoice,
  listInvoices,
  getInvoice,
  updateInvoice,
  updateInvoiceStatus,
  deleteInvoice,
  generateInvoicePDF,
  getInvoiceStats,
  getFinancialDashboard,
  getProfitLossReport,
} from '../controllers/accounting.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Expense routes
router.post('/expenses', validate(createExpenseSchema), createExpense);
router.get('/expenses', validate(listExpensesSchema), listExpenses);
router.get('/expenses/stats', getExpenseStats);
router.get('/expenses/:id', getExpense);
router.put('/expenses/:id', validate(updateExpenseSchema), updateExpense);
router.patch('/expenses/:id/approve', validate(approveExpenseSchema), approveExpense);
router.delete('/expenses/:id', deleteExpense);

// Income routes
router.post('/income', validate(createIncomeSchema), createIncome);
router.get('/income', validate(listIncomesSchema), listIncomes);
router.get('/income/stats', getIncomeStats);
router.get('/income/:id', getIncome);
router.put('/income/:id', validate(updateIncomeSchema), updateIncome);
router.delete('/income/:id', deleteIncome);

// Invoice routes
router.post('/invoices', validate(createInvoiceSchema), createInvoice);
router.get('/invoices', validate(listInvoicesSchema), listInvoices);
router.get('/invoices/stats', getInvoiceStats);
router.get('/invoices/:id', getInvoice);
router.get('/invoices/:id/pdf', generateInvoicePDF);
router.put('/invoices/:id', validate(updateInvoiceSchema), updateInvoice);
router.patch('/invoices/:id/status', updateInvoiceStatus);
router.delete('/invoices/:id', deleteInvoice);

// Financial reports routes
router.get('/reports/dashboard', getFinancialDashboard);
router.get('/reports/profit-loss', validate(financialReportSchema), getProfitLossReport);

export default router;
