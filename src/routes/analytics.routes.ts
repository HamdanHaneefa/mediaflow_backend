import { Router } from 'express';
import {
  getDashboardMetrics,
  getRevenueDashboard,
  getExpenseDashboard,
  getProjectsDashboard,
  getTasksDashboard,
  getRevenueTrends,
  getRevenueByClient,
  getRevenueByProject,
  getRevenueForecast,
  getExpenseTrends,
  getExpensesByCategory,
  getExpensesByProject,
  getProjectProfitability,
  getProjectPerformance,
  getTeamPerformance,
  getTeamUtilization,
} from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateQuery } from '../middleware/validation.middleware';
import {
  dashboardQuerySchema,
  revenueTrendsQuerySchema,
  revenueByClientQuerySchema,
  revenueByProjectQuerySchema,
  revenueForecastQuerySchema,
  expenseTrendsQuerySchema,
  expenseByCategoryQuerySchema,
  expenseByProjectQuerySchema,
  projectProfitabilityQuerySchema,
  projectPerformanceQuerySchema,
  teamPerformanceQuerySchema,
  teamUtilizationQuerySchema,
} from '../validators/analytics.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * Dashboard Routes
 */
router.get(
  '/dashboard',
  validateQuery(dashboardQuerySchema),
  getDashboardMetrics
);

router.get(
  '/dashboard/revenue',
  validateQuery(dashboardQuerySchema),
  getRevenueDashboard
);

router.get(
  '/dashboard/expenses',
  validateQuery(dashboardQuerySchema),
  getExpenseDashboard
);

router.get(
  '/dashboard/projects',
  validateQuery(dashboardQuerySchema),
  getProjectsDashboard
);

router.get(
  '/dashboard/tasks',
  validateQuery(dashboardQuerySchema),
  getTasksDashboard
);

/**
 * Revenue Analytics Routes
 */
router.get(
  '/revenue/trends',
  validateQuery(revenueTrendsQuerySchema),
  getRevenueTrends
);

router.get(
  '/revenue/by-client',
  validateQuery(revenueByClientQuerySchema),
  getRevenueByClient
);

router.get(
  '/revenue/by-project',
  validateQuery(revenueByProjectQuerySchema),
  getRevenueByProject
);

router.get(
  '/revenue/forecast',
  validateQuery(revenueForecastQuerySchema),
  getRevenueForecast
);

/**
 * Expense Analytics Routes
 */
router.get(
  '/expenses/trends',
  validateQuery(expenseTrendsQuerySchema),
  getExpenseTrends
);

router.get(
  '/expenses/by-category',
  validateQuery(expenseByCategoryQuerySchema),
  getExpensesByCategory
);

router.get(
  '/expenses/by-project',
  validateQuery(expenseByProjectQuerySchema),
  getExpensesByProject
);

/**
 * Project Analytics Routes
 */
router.get(
  '/projects/profitability',
  validateQuery(projectProfitabilityQuerySchema),
  getProjectProfitability
);

router.get(
  '/projects/performance',
  validateQuery(projectPerformanceQuerySchema),
  getProjectPerformance
);

/**
 * Team Analytics Routes
 */
router.get(
  '/team/performance',
  validateQuery(teamPerformanceQuerySchema),
  getTeamPerformance
);

router.get(
  '/team/utilization',
  validateQuery(teamUtilizationQuerySchema),
  getTeamUtilization
);

export default router;
