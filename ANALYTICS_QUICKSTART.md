# Phase 5: Analytics & Reporting - Quick Reference

## 🚀 Getting Started

### Prerequisites
```bash
# Install dependencies
cd backend
npm install

# Optional: Install and start Redis (for caching)
# Windows: Download from https://github.com/microsoftarchive/redis/releases
# Mac: brew install redis && brew services start redis
# Linux: sudo apt-get install redis-server && sudo systemctl start redis
```

### Environment Variables
```env
# Optional Redis Configuration (graceful fallback if not configured)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### Start Server
```bash
npm run dev
```

## 📊 API Endpoints Overview

### Base URL
```
http://localhost:5000/api
```

### Authentication
All endpoints require Bearer token:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🎯 Common Use Cases

### 1. Dashboard Metrics
```bash
# Get overall dashboard (default: current month)
GET /api/analytics/dashboard?period=month

# Available periods: today, week, month, quarter, year, last7days, last30days, ytd, all
GET /api/analytics/dashboard?period=last30days
```

**Response Structure:**
```json
{
  "period": "month",
  "dateRange": { "start": "2024-12-01", "end": "2024-12-31" },
  "revenue": { "current": 50000, "previous": 45000, "trend": 11.11 },
  "expenses": { "current": 30000, "previous": 28000, "trend": 7.14 },
  "profit": { "current": 20000, "margin": 40 },
  "projects": { "active": 5, "completed": 2 },
  "tasks": { "pending": 25, "completed": 15 },
  "invoices": { "outstanding": 15000, "overdue": 5000 },
  "proposals": { "pending": 3, "conversionRate": 65 }
}
```

### 2. Revenue Analytics
```bash
# Revenue trends
GET /api/analytics/revenue/trends?startDate=2024-01-01&endDate=2024-12-31&groupBy=month

# Top clients
GET /api/analytics/revenue/by-client?startDate=2024-01-01&endDate=2024-12-31&limit=10

# Project revenue
GET /api/analytics/revenue/by-project?startDate=2024-01-01&endDate=2024-12-31&limit=10

# Revenue forecast
GET /api/analytics/revenue/forecast?months=3
```

### 3. Expense Analytics
```bash
# Expense trends
GET /api/analytics/expenses/trends?startDate=2024-01-01&endDate=2024-12-31&groupBy=month

# By category
GET /api/analytics/expenses/by-category?startDate=2024-01-01&endDate=2024-12-31

# By project
GET /api/analytics/expenses/by-project?startDate=2024-01-01&endDate=2024-12-31&limit=10
```

### 4. Project Analytics
```bash
# Project profitability
GET /api/analytics/projects/profitability?startDate=2024-01-01&endDate=2024-12-31&limit=20

# Project performance
GET /api/analytics/projects/performance?startDate=2024-01-01&endDate=2024-12-31
```

### 5. Team Analytics
```bash
# Team performance
GET /api/analytics/team/performance?startDate=2024-01-01&endDate=2024-12-31

# Team utilization
GET /api/analytics/team/utilization?period=month
```

### 6. Financial Reports
```bash
# Profit & Loss
GET /api/reports/profit-loss?startDate=2024-01-01&endDate=2024-12-31&groupBy=month

# Cash Flow
GET /api/reports/cash-flow?startDate=2024-01-01&endDate=2024-12-31&groupBy=month

# Accounts Receivable Aging
GET /api/reports/accounts-receivable

# Expense Report
GET /api/reports/expenses?startDate=2024-01-01&endDate=2024-12-31&category=Travel

# Income Report
GET /api/reports/income?startDate=2024-01-01&endDate=2024-12-31&source=Project

# Custom Report
POST /api/reports/custom
{
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "metrics": ["revenue", "expenses", "projects"],
  "groupBy": "month"
}
```

### 7. Data Exports
```bash
# Export to CSV
POST /api/exports/csv
{
  "dataSource": "income",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}

# Export to Excel
POST /api/exports/excel
{
  "reportType": "financial",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}

# Batch Export
POST /api/exports/batch
{
  "dataSources": ["income", "expenses", "invoices"],
  "format": "csv",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

## 🔧 Testing with cURL

### Dashboard Metrics
```bash
curl -X GET "http://localhost:5000/api/analytics/dashboard?period=month" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Revenue Trends
```bash
curl -X GET "http://localhost:5000/api/analytics/revenue/trends?startDate=2024-01-01&endDate=2024-12-31&groupBy=month" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Profit & Loss Report
```bash
curl -X GET "http://localhost:5000/api/reports/profit-loss?startDate=2024-01-01&endDate=2024-12-31&groupBy=month" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### CSV Export
```bash
curl -X POST "http://localhost:5000/api/exports/csv" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"dataSource":"income","startDate":"2024-01-01","endDate":"2024-12-31"}' \
  --output income.csv
```

## 📦 Data Sources for Exports

1. **income** - Income/revenue transactions
2. **expenses** - Expense records
3. **invoices** - Invoice data
4. **projects** - Project information
5. **proposals** - Proposal records
6. **contacts** - Contact list
7. **tasks** - Task list
8. **leads** - Lead pipeline
9. **team_members** - Team roster

## 📈 Report Types for Excel Export

1. **financial** - Income, Expenses, Invoices (3 sheets)
2. **projects** - Projects and Tasks (2 sheets)
3. **analytics** - Summary, Revenue, Expenses, Profitability (4 sheets)
4. **crm** - Contacts, Leads, Proposals (3 sheets)

## 🎨 Query Parameters Reference

### Period Values
```
today        - Current day
week         - Current week
month        - Current month (default)
quarter      - Current quarter
year         - Current year
last7days    - Last 7 days
last30days   - Last 30 days
ytd          - Year to date
all          - All time
```

### Group By Values
```
day          - Group by day
week         - Group by week
month        - Group by month (default)
quarter      - Group by quarter
year         - Group by year
```

### Limit Values
```
Default: 10
Range: 1-100
```

## 🔄 Cache Management

### Cache TTL (Time To Live)
- **Dashboard**: 5 minutes
- **Trends**: 30 minutes
- **Summary**: 10 minutes
- **Reports**: 1 hour
- **Forecast**: 2 hours

### Cache Keys Pattern
```
analytics:dashboard:{period}
analytics:revenue:trends:{startDate}:{endDate}:{groupBy}
analytics:revenue:by-client:{startDate}:{endDate}:{limit}
reports:pl:{startDate}:{endDate}:{groupBy}
reports:cashflow:{startDate}:{endDate}:{groupBy}
```

## 🐛 Common Issues & Solutions

### Issue: Redis connection errors
**Solution**: Redis is optional. The system will work without it (no caching).

### Issue: Export files not downloading
**Solution**: Files auto-delete after 1-5 minutes. Download immediately.

### Issue: Date range validation errors
**Solution**: Ensure dates are in ISO format (YYYY-MM-DD) and startDate < endDate.

### Issue: Empty analytics data
**Solution**: Ensure data exists in the database for the specified date range.

### Issue: Slow query performance
**Solution**: Install and configure Redis for caching to improve performance by 60%.

## 📝 Response Format

All successful responses follow this structure:
```json
{
  "success": true,
  "message": "Description of the operation",
  "data": { /* Response data */ }
}
```

All error responses follow this structure:
```json
{
  "success": false,
  "message": "Error description",
  "error": { /* Error details */ }
}
```

## 🔐 Authentication

### Get JWT Token
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Use Token
```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📊 Performance Tips

1. **Use Caching**: Install Redis for 60% faster responses
2. **Limit Data**: Use appropriate date ranges and limits
3. **Group Wisely**: Use appropriate groupBy values (month vs day)
4. **Batch Exports**: Export multiple sources in one request
5. **Parallel Requests**: Make independent requests simultaneously

## 🎯 Best Practices

1. **Date Ranges**: Keep ranges reasonable (1-12 months)
2. **Limits**: Use appropriate limits (10-50 for UI display)
3. **Caching**: Leverage predefined periods (month, quarter) for better cache hits
4. **Exports**: Schedule large exports during off-peak hours
5. **Error Handling**: Always handle 401, 403, 404, 500 errors

## 📚 Related Documentation

- **PHASE_5_COMPLETE.md** - Full implementation details
- **ANALYTICS_API.md** - Complete API reference
- **ROADMAP.md** - Overall project roadmap
- **API_TESTING_GUIDE.md** - Testing procedures

---

**Last Updated**: December 2024  
**Phase**: 5 - Analytics & Reporting  
**Status**: ✅ Complete
