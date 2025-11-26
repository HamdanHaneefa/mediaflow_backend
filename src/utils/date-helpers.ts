import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  subDays,
  subWeeks,
  subMonths,
  subQuarters,
  subYears,
  format,
  parseISO,
} from 'date-fns';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Get date range based on period
 */
export function getDateRangeFromPeriod(period: string): DateRange {
  const now = new Date();

  switch (period) {
    case 'today':
      return {
        startDate: startOfDay(now),
        endDate: endOfDay(now),
      };

    case 'week':
      return {
        startDate: startOfWeek(now, { weekStartsOn: 1 }), // Monday
        endDate: endOfWeek(now, { weekStartsOn: 1 }),
      };

    case 'month':
      return {
        startDate: startOfMonth(now),
        endDate: endOfMonth(now),
      };

    case 'quarter':
      return {
        startDate: startOfQuarter(now),
        endDate: endOfQuarter(now),
      };

    case 'year':
      return {
        startDate: startOfYear(now),
        endDate: endOfYear(now),
      };

    case 'last7days':
      return {
        startDate: subDays(now, 7),
        endDate: now,
      };

    case 'last30days':
      return {
        startDate: subDays(now, 30),
        endDate: now,
      };

    case 'last90days':
      return {
        startDate: subDays(now, 90),
        endDate: now,
      };

    case 'lastWeek':
      return {
        startDate: startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }),
        endDate: endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }),
      };

    case 'lastMonth':
      return {
        startDate: startOfMonth(subMonths(now, 1)),
        endDate: endOfMonth(subMonths(now, 1)),
      };

    case 'lastQuarter':
      return {
        startDate: startOfQuarter(subQuarters(now, 1)),
        endDate: endOfQuarter(subQuarters(now, 1)),
      };

    case 'lastYear':
      return {
        startDate: startOfYear(subYears(now, 1)),
        endDate: endOfYear(subYears(now, 1)),
      };

    case 'ytd':
    case 'yearToDate':
      return {
        startDate: startOfYear(now),
        endDate: now,
      };

    case 'all':
    default:
      return {
        startDate: new Date('2020-01-01'), // Default far past date
        endDate: now,
      };
  }
}

/**
 * Parse custom date range
 */
export function parseDateRange(
  startDateStr?: string,
  endDateStr?: string,
  period?: string
): DateRange {
  // If period is provided, use it
  if (period) {
    return getDateRangeFromPeriod(period);
  }

  // Parse custom dates
  const startDate = startDateStr ? parseISO(startDateStr) : new Date('2020-01-01');
  const endDate = endDateStr ? parseISO(endDateStr) : new Date();

  return { startDate, endDate };
}

/**
 * Format date for display
 */
export function formatDate(date: Date, formatStr: string = 'yyyy-MM-dd'): string {
  return format(date, formatStr);
}

/**
 * Format date range for display
 */
export function formatDateRange(range: DateRange, formatStr: string = 'yyyy-MM-dd'): string {
  return `${format(range.startDate, formatStr)} to ${format(range.endDate, formatStr)}`;
}

/**
 * Get SQL date format for grouping
 */
export function getDateGroupFormat(groupBy: string): string {
  switch (groupBy) {
    case 'day':
      return 'yyyy-MM-dd';
    case 'week':
      return 'YYYY-ww'; // ISO week
    case 'month':
      return 'yyyy-MM';
    case 'quarter':
      return 'yyyy-QQ';
    case 'year':
      return 'yyyy';
    default:
      return 'yyyy-MM-dd';
  }
}

/**
 * Group dates by period
 */
export function groupDatesByPeriod(dates: Date[], groupBy: string): Map<string, Date[]> {
  const grouped = new Map<string, Date[]>();

  for (const date of dates) {
    const key = format(date, getDateGroupFormat(groupBy));
    
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    
    grouped.get(key)!.push(date);
  }

  return grouped;
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(current: number, previous: number): string {
  if (previous === 0) {
    return current > 0 ? '+100%' : '0%';
  }

  const change = ((current - previous) / previous) * 100;
  const sign = change > 0 ? '+' : '';
  
  return `${sign}${change.toFixed(1)}%`;
}

/**
 * Calculate growth rate
 */
export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Get date range for comparison (previous period)
 */
export function getPreviousPeriodRange(range: DateRange, period: string): DateRange {
  const duration = range.endDate.getTime() - range.startDate.getTime();
  
  switch (period) {
    case 'day':
    case 'today':
      return {
        startDate: subDays(range.startDate, 1),
        endDate: subDays(range.endDate, 1),
      };

    case 'week':
      return {
        startDate: subWeeks(range.startDate, 1),
        endDate: subWeeks(range.endDate, 1),
      };

    case 'month':
      return {
        startDate: subMonths(range.startDate, 1),
        endDate: subMonths(range.endDate, 1),
      };

    case 'quarter':
      return {
        startDate: subQuarters(range.startDate, 1),
        endDate: subQuarters(range.endDate, 1),
      };

    case 'year':
      return {
        startDate: subYears(range.startDate, 1),
        endDate: subYears(range.endDate, 1),
      };

    default:
      // For custom ranges, go back by the same duration
      return {
        startDate: new Date(range.startDate.getTime() - duration),
        endDate: new Date(range.endDate.getTime() - duration),
      };
  }
}
