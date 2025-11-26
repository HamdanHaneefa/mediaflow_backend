import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { AnalyticsService } from '../services/analytics.service';
import { successResponse } from '../utils/response';

const dashboardService = new DashboardService();
const analyticsService = new AnalyticsService();

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get overall dashboard metrics
 * @access  Private
 */
export const getDashboardMetrics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { period = 'month' } = req.query;
    const data = await dashboardService.getDashboardMetrics(period as string);
    successResponse(res, data, 'Dashboard metrics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/analytics/dashboard/revenue
 * @desc    Get revenue dashboard data
 * @access  Private
 */
export const getRevenueDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { period = 'month' } = req.query;
    const data = await dashboardService.getRevenueDashboard(period as string);
    successResponse(res, data, 'Revenue dashboard retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/analytics/dashboard/expenses
 * @desc    Get expense dashboard data
 * @access  Private
 */
export const getExpenseDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { period = 'month' } = req.query;
    const data = await dashboardService.getExpenseDashboard(period as string);
    successResponse(res, data, 'Expense dashboard retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/analytics/dashboard/projects
 * @desc    Get projects dashboard data
 * @access  Private
 */
export const getProjectsDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { period = 'month' } = req.query;
    const data = await dashboardService.getProjectsDashboard(period as string);
    successResponse(res, data, 'Projects dashboard retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/analytics/dashboard/tasks
 * @desc    Get tasks dashboard data
 * @access  Private
 */
export const getTasksDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { period = 'month' } = req.query;
    const data = await dashboardService.getTasksDashboard(period as string);
    successResponse(res, data, 'Tasks dashboard retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/analytics/revenue/trends
 * @desc    Get revenue trends
 * @access  Private
 */
export const getRevenueTrends = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    const data = await analyticsService.getRevenueTrends(
      startDate as string,
      endDate as string,
      groupBy as 'day' | 'week' | 'month'
    );
    successResponse(res, data, 'Revenue trends retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/analytics/revenue/by-client
 * @desc    Get revenue by client
 * @access  Private
 */
export const getRevenueByClient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;
    const data = await analyticsService.getRevenueByClient(
      startDate as string,
      endDate as string,
      Number(limit)
    );
    successResponse(res, data, 'Revenue by client retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/analytics/revenue/by-project
 * @desc    Get revenue by project
 * @access  Private
 */
export const getRevenueByProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;
    const data = await analyticsService.getRevenueByProject(
      startDate as string,
      endDate as string,
      Number(limit)
    );
    successResponse(res, data, 'Revenue by project retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/analytics/revenue/forecast
 * @desc    Get revenue forecast
 * @access  Private
 */
export const getRevenueForecast = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { months = 3 } = req.query;
    const data = await analyticsService.getRevenueForecast(Number(months));
    successResponse(res, data, 'Revenue forecast retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/analytics/expenses/trends
 * @desc    Get expense trends
 * @access  Private
 */
export const getExpenseTrends = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    const data = await analyticsService.getExpenseTrends(
      startDate as string,
      endDate as string,
      groupBy as 'day' | 'week' | 'month'
    );
    successResponse(res, data, 'Expense trends retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/analytics/expenses/by-category
 * @desc    Get expenses by category
 * @access  Private
 */
export const getExpensesByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await analyticsService.getExpensesByCategory(
      startDate as string,
      endDate as string
    );
    successResponse(res, data, 'Expenses by category retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/analytics/expenses/by-project
 * @desc    Get expenses by project
 * @access  Private
 */
export const getExpensesByProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;
    const data = await analyticsService.getExpensesByProject(
      startDate as string,
      endDate as string,
      Number(limit)
    );
    successResponse(res, data, 'Expenses by project retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/analytics/projects/profitability
 * @desc    Get project profitability analysis
 * @access  Private
 */
export const getProjectProfitability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, limit = 20 } = req.query;
    const data = await analyticsService.getProjectProfitability(
      startDate as string | undefined,
      endDate as string | undefined,
      Number(limit)
    );
    successResponse(res, data, 'Project profitability retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/analytics/projects/performance
 * @desc    Get project performance metrics
 * @access  Private
 */
export const getProjectPerformance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await analyticsService.getProjectPerformance(
      startDate as string | undefined,
      endDate as string | undefined
    );
    successResponse(res, data, 'Project performance retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/analytics/team/performance
 * @desc    Get team performance metrics
 * @access  Private
 */
export const getTeamPerformance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await analyticsService.getTeamPerformance(
      startDate as string,
      endDate as string
    );
    successResponse(res, data, 'Team performance retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/analytics/team/utilization
 * @desc    Get team utilization metrics
 * @access  Private
 */
export const getTeamUtilization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { period = 'month' } = req.query;
    const data = await analyticsService.getTeamUtilization(period as string);
    successResponse(res, data, 'Team utilization retrieved successfully');
  } catch (error) {
    next(error);
  }
};
