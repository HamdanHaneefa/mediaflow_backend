import Redis from 'ioredis';
import env from '../config/env';
import logger from '../utils/logger';

class CacheService {
  private client: Redis | null = null;
  private isConnected: boolean = false;
  private redisEnabled: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Only enable Redis if explicitly set to 'true'
    this.redisEnabled = env.REDIS_ENABLED === 'true';

    if (!this.redisEnabled) {
      logger.info('📦 Redis disabled - using in-memory fallback for cache operations');
      return;
    }

    try {
      // Redis configuration
      const redisConfig = {
        host: env.REDIS_HOST || 'localhost',
        port: parseInt(env.REDIS_PORT || '6379'),
        password: env.REDIS_PASSWORD || undefined,
        db: parseInt(env.REDIS_DB || '0'),
        retryStrategy: (times: number) => {
          // Stop retrying after 3 attempts
          if (times > 3) {
            logger.warn('⚠️  Redis connection failed after 3 attempts, disabling Redis');
            this.redisEnabled = false;
            return null; // Stop retrying
          }
          const delay = Math.min(times * 1000, 3000);
          return delay;
        },
        maxRetriesPerRequest: 3,
        lazyConnect: true, // Don't connect immediately
      };

      this.client = new Redis(redisConfig);

      this.client.on('connect', () => {
        this.isConnected = true;
        logger.info('✅ Redis connected successfully');
      });

      this.client.on('error', () => {
        this.isConnected = false;
        // Only log once, then disable
        if (this.redisEnabled) {
          logger.warn('⚠️  Redis connection error - falling back to in-memory cache');
          this.redisEnabled = false;
        }
      });

      this.client.on('close', () => {
        this.isConnected = false;
        logger.info('📦 Redis connection closed - using in-memory fallback');
      });

      // Try to connect
      this.client.connect().catch(() => {
        logger.warn('⚠️  Redis not available - using in-memory fallback');
        this.redisEnabled = false;
        this.isConnected = false;
      });
    } catch (error) {
      logger.warn('⚠️  Failed to initialize Redis - using in-memory fallback');
      this.client = null;
      this.redisEnabled = false;
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected || !this.client) {
      logger.warn('Redis not available, skipping cache get');
      return null;
    }

    try {
      const value = await this.client.get(key);
      if (!value) return null;
      
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error(`Error getting cache key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL (in seconds)
   */
  async set(key: string, value: any, ttl: number = 300): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      logger.warn('Redis not available, skipping cache set');
      return false;
    }

    try {
      const serialized = JSON.stringify(value);
      await this.client.setex(key, ttl, serialized);
      return true;
    } catch (error) {
      logger.error(`Error setting cache key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete specific key from cache
   */
  async del(key: string): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error(`Error deleting cache key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys matching a pattern
   */
  async delPattern(pattern: string): Promise<number> {
    if (!this.isConnected || !this.client) {
      return 0;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) return 0;
      
      await this.client.del(...keys);
      return keys.length;
    } catch (error) {
      logger.error(`Error deleting cache pattern ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Error checking cache key ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.flushdb();
      logger.info('Cache cleared successfully');
      return true;
    } catch (error) {
      logger.error('Error clearing cache:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<any> {
    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      const info = await this.client.info('stats');
      const dbsize = await this.client.dbsize();
      
      return {
        connected: this.isConnected,
        dbsize,
        info,
      };
    } catch (error) {
      logger.error('Error getting cache stats:', error);
      return null;
    }
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
}

// Cache keys constants
export const CACHE_KEYS = {
  // Dashboard
  DASHBOARD: (period: string) => `analytics:dashboard:${period}`,
  DASHBOARD_REVENUE: (period: string) => `analytics:dashboard:revenue:${period}`,
  DASHBOARD_EXPENSES: (period: string) => `analytics:dashboard:expenses:${period}`,
  DASHBOARD_PROJECTS: (period: string) => `analytics:dashboard:projects:${period}`,
  DASHBOARD_TASKS: (period: string) => `analytics:dashboard:tasks:${period}`,
  
  // Revenue Analytics
  REVENUE_TRENDS: (startDate: string, endDate: string, groupBy: string) => 
    `analytics:revenue:trends:${startDate}:${endDate}:${groupBy}`,
  REVENUE_BY_CLIENT: (startDate: string, endDate: string) => 
    `analytics:revenue:by-client:${startDate}:${endDate}`,
  REVENUE_BY_PROJECT: (startDate: string, endDate: string) => 
    `analytics:revenue:by-project:${startDate}:${endDate}`,
  REVENUE_FORECAST: (months: number) => `analytics:revenue:forecast:${months}`,
  REVENUE_SUMMARY: (startDate: string, endDate: string) => 
    `analytics:revenue:summary:${startDate}:${endDate}`,
  
  // Expense Analytics
  EXPENSE_TRENDS: (startDate: string, endDate: string, groupBy: string) => 
    `analytics:expenses:trends:${startDate}:${endDate}:${groupBy}`,
  EXPENSE_BY_CATEGORY: (startDate: string, endDate: string) => 
    `analytics:expenses:by-category:${startDate}:${endDate}`,
  EXPENSE_BY_PROJECT: (startDate: string, endDate: string) => 
    `analytics:expenses:by-project:${startDate}:${endDate}`,
  EXPENSE_SUMMARY: (startDate: string, endDate: string) => 
    `analytics:expenses:summary:${startDate}:${endDate}`,
  
  // Project Analytics
  PROJECT_PROFITABILITY: (startDate: string, endDate: string) => 
    `analytics:projects:profitability:${startDate}:${endDate}`,
  PROJECT_PERFORMANCE: (startDate: string, endDate: string) => 
    `analytics:projects:performance:${startDate}:${endDate}`,
  PROJECT_SUMMARY: (startDate: string, endDate: string) => 
    `analytics:projects:summary:${startDate}:${endDate}`,
  
  // Team Analytics
  TEAM_PERFORMANCE: (startDate: string, endDate: string) => 
    `analytics:team:performance:${startDate}:${endDate}`,
  TEAM_UTILIZATION: (startDate: string, endDate: string) => 
    `analytics:team:utilization:${startDate}:${endDate}`,
  
  // Reports
  REPORT_PL: (startDate: string, endDate: string, groupBy: string) => 
    `reports:pl:${startDate}:${endDate}:${groupBy}`,
  REPORT_CASHFLOW: (startDate: string, endDate: string, groupBy: string) => 
    `reports:cashflow:${startDate}:${endDate}:${groupBy}`,
  REPORT_AR: () => `reports:ar`,
  REPORT_EXPENSE: (startDate: string, endDate: string, category: string) => 
    `reports:expense:${startDate}:${endDate}:${category}`,
  REPORT_INCOME: (startDate: string, endDate: string, source: string) => 
    `reports:income:${startDate}:${endDate}:${source}`,
};

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  DASHBOARD: 300,       // 5 minutes
  TRENDS: 1800,         // 30 minutes
  SUMMARY: 600,         // 10 minutes
  REPORTS: 3600,        // 1 hour
  FORECAST: 7200,       // 2 hours
};

// Singleton instance
const cacheService = new CacheService();

export default cacheService;
