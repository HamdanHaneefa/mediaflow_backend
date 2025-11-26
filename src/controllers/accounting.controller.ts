import { Request, Response, NextFunction } from 'express';
import { ExpenseService, IncomeService, FinancialReportService } from '../services/accounting.service';
import { InvoiceService } from '../services/invoice.service';
import { successResponse } from '../utils/response';

const expenseService = new ExpenseService();
const incomeService = new IncomeService();
const invoiceService = new InvoiceService();
const reportService = new FinancialReportService();

// Expense Controllers
export const createExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const expense = await expenseService.create(req.body, req.user!.id);
    return successResponse(res, expense, 'Expense created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const listExpenses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await expenseService.list(req.query);
    return successResponse(res, result, 'Expenses retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const expense = await expenseService.getById(req.params.id);
    return successResponse(res, expense, 'Expense retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const expense = await expenseService.update(req.params.id, req.body);
    return successResponse(res, expense, 'Expense updated successfully');
  } catch (error) {
    next(error);
  }
};

export const approveExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, notes } = req.body;
    const expense = await expenseService.approve(req.params.id, status, req.user!.id, notes);
    return successResponse(res, expense, `Expense ${status.toLowerCase()} successfully`);
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await expenseService.delete(req.params.id);
    return successResponse(res, result, 'Expense deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const getExpenseStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await expenseService.getStats(req.query);
    return successResponse(res, stats, 'Expense statistics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Income Controllers
export const createIncome = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const income = await incomeService.create(req.body, req.user!.id);
    return successResponse(res, income, 'Income created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const listIncomes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await incomeService.list(req.query);
    return successResponse(res, result, 'Income records retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getIncome = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const income = await incomeService.getById(req.params.id);
    return successResponse(res, income, 'Income retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateIncome = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const income = await incomeService.update(req.params.id, req.body);
    return successResponse(res, income, 'Income updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteIncome = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await incomeService.delete(req.params.id);
    return successResponse(res, result, 'Income deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const getIncomeStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await incomeService.getStats(req.query);
    return successResponse(res, stats, 'Income statistics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Invoice Controllers
export const createInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await invoiceService.create(req.body, req.user!.id);
    return successResponse(res, invoice, 'Invoice created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const listInvoices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await invoiceService.list(req.query);
    return successResponse(res, result, 'Invoices retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await invoiceService.getById(req.params.id);
    return successResponse(res, invoice, 'Invoice retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await invoiceService.update(req.params.id, req.body);
    return successResponse(res, invoice, 'Invoice updated successfully');
  } catch (error) {
    next(error);
  }
};

export const updateInvoiceStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const invoice = await invoiceService.updateStatus(req.params.id, status);
    return successResponse(res, invoice, 'Invoice status updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await invoiceService.delete(req.params.id);
    return successResponse(res, result, 'Invoice deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const generateInvoicePDF = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pdfUrl = await invoiceService.generatePDF(req.params.id);
    return successResponse(res, { url: pdfUrl }, 'Invoice PDF generated successfully');
  } catch (error) {
    next(error);
  }
};

export const getInvoiceStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await invoiceService.getStats(req.query);
    return successResponse(res, stats, 'Invoice statistics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Financial Report Controllers
export const getFinancialDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dashboard = await reportService.getDashboard(req.query);
    return successResponse(res, dashboard, 'Financial dashboard retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getProfitLossReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await reportService.getProfitLoss(req.query as any);
    return successResponse(res, report, 'Profit & Loss report generated successfully');
  } catch (error) {
    next(error);
  }
};
