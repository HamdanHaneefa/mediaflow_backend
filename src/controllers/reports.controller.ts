import { Request, Response, NextFunction } from 'express';
import { ReportsService } from '../services/reports.service';
import { successResponse } from '../utils/response';

const reportsService = new ReportsService();

/**
 * @route   GET /api/reports/profit-loss
 * @desc    Generate Profit & Loss report
 * @access  Private
 */
export const getProfitLossReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, groupBy = 'month' } = req.query;
    const report = await reportsService.generateProfitLossReport(
      startDate as string,
      endDate as string,
      groupBy as 'day' | 'week' | 'month' | 'quarter'
    );
    successResponse(res, report, 'Profit & Loss report generated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/reports/cash-flow
 * @desc    Generate Cash Flow report
 * @access  Private
 */
export const getCashFlowReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, groupBy = 'month' } = req.query;
    const report = await reportsService.generateCashFlowReport(
      startDate as string,
      endDate as string,
      groupBy as 'day' | 'week' | 'month'
    );
    successResponse(res, report, 'Cash Flow report generated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/reports/accounts-receivable
 * @desc    Generate Accounts Receivable Aging report
 * @access  Private
 */
export const getAccountsReceivableReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const report = await reportsService.generateAccountsReceivableReport();
    successResponse(res, report, 'Accounts Receivable report generated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/reports/expenses
 * @desc    Generate Expense report
 * @access  Private
 */
export const getExpenseReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, category } = req.query;
    const report = await reportsService.generateExpenseReport(
      startDate as string,
      endDate as string,
      category as string | undefined
    );
    successResponse(res, report, 'Expense report generated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/reports/income
 * @desc    Generate Income report
 * @access  Private
 */
export const getIncomeReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, source } = req.query;
    const report = await reportsService.generateIncomeReport(
      startDate as string,
      endDate as string,
      source as string | undefined
    );
    successResponse(res, report, 'Income report generated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/reports/custom
 * @desc    Generate Custom report
 * @access  Private
 */
export const getCustomReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const config = req.body;
    const report = await reportsService.generateCustomReport(config);
    successResponse(res, report, 'Custom report generated successfully');
  } catch (error) {
    next(error);
  }
};
