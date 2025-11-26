# Phase 5: Analytics & Reporting - API Endpoints Reference

## Quick Navigation
- [Dashboard Analytics](#dashboard-analytics) (5 endpoints)
- [Revenue Analytics](#revenue-analytics) (4 endpoints)
- [Expense Analytics](#expense-analytics) (3 endpoints)
- [Project Analytics](#project-analytics) (2 endpoints)
- [Team Analytics](#team-analytics) (2 endpoints)
- [Financial Reports](#financial-reports) (6 endpoints)
- [Data Exports](#data-exports) (3 endpoints)

---

## Dashboard Analytics

### 1. Overall Dashboard
**GET** `/api/analytics/dashboard`

Get overall business metrics dashboard.

**Query Parameters:**
- `period` (optional): `today` | `week` | `month` | `quarter` | `year` | `last7days` | `last30days` | `ytd` | `all`
  - Default: `month`

**Response:**
```json
{
  "period": "month",
  "dateRange": { "start": "...", "end": "..." },
  "revenue": { "current": 0, "previous": 0, "trend": 0, "count": 0 },
  "expenses": { "current": 0, "previous": 0, "trend": 0, "count": 0 },
  "profit": { "current": 0, "previous": 0, "margin": 0 },
  "projects": { "active": 0, "completed": 0, "total": 0, "completionRate": 0 },
  "tasks": { "pending": 0, "completed": 0, "total": 0, "completionRate": 0 },
  "invoices": { "outstanding": 0, "outstandingCount": 0, "overdue": 0, "overdueCount": 0 },
  "proposals": { "pending": 0, "accepted": 0, "total": 0, "conversionRate": 0 },
  "leads": { "new": 0, "converted": 0, "total": 0, "conversionRate": 0, "pipelineValue": 0 }
}
```

---

### 2. Revenue Dashboard
**GET** `/api/analytics/dashboard/revenue`

Revenue-focused dashboard with top clients and projects.

**Query Parameters:**
- `period` (optional): Same as overall dashboard

**Response:**
```json
{
  "summary": { "total": 0, "count": 0, "average": 0, "trend": 0 },
  "topClients": [{ "clientId": 0, "clientName": "", "revenue": 0, "count": 0 }],
  "topProjects": [{ "projectId": 0, "projectName": "", "revenue": 0 }],
  "bySource": [{ "source": "", "amount": 0, "count": 0 }]
}
```

---

### 3. Expense Dashboard
**GET** `/api/analytics/dashboard/expenses`

Expense-focused dashboard with category breakdown.

**Query Parameters:**
- `period` (optional): Same as overall dashboard

**Response:**
```json
{
  "summary": { "total": 0, "count": 0, "average": 0, "trend": 0, "pending": 0, "pendingCount": 0 },
  "topCategories": [{ "category": "", "amount": 0, "count": 0 }],
  "topProjects": [{ "projectId": 0, "projectName": "", "expenses": 0 }]
}
```

---

### 4. Projects Dashboard
**GET** `/api/analytics/dashboard/projects`

Project status and profitability dashboard.

**Query Parameters:**
- `period` (optional): Same as overall dashboard

**Response:**
```json
{
  "active": 0,
  "completed": 0,
  "total": 0,
  "completionRate": 0,
  "byStatus": [{ "status": "", "_count": 0 }],
  "topProfitable": [{ "id": 0, "title": "", "revenue": 0, "expenses": 0, "profit": 0, "margin": 0 }]
}
```

---

### 5. Tasks Dashboard
**GET** `/api/analytics/dashboard/tasks`

Task management and team workload dashboard.

**Query Parameters:**
- `period` (optional): Same as overall dashboard

**Response:**
```json
{
  "pending": 0,
  "completed": 0,
  "total": 0,
  "completionRate": 0,
  "byStatus": [{ "status": "", "_count": 0 }],
  "byPriority": [{ "priority": "", "_count": 0 }],
  "overdue": { "count": 0, "tasks": [] }
}
```

---

## Revenue Analytics

### 6. Revenue Trends
**GET** `/api/analytics/revenue/trends`

Revenue trends over time with growth calculations.

**Query Parameters:**
- `startDate` (required): ISO date (YYYY-MM-DD)
- `endDate` (required): ISO date (YYYY-MM-DD)
- `groupBy` (optional): `day` | `week` | `month`
  - Default: `day`

**Response:**
```json
{
  "data": [{ "period": "", "value": 0, "count": 0, "growth": 0 }],
  "summary": { "total": 0, "count": 0, "average": 0 }
}
```

---

### 7. Revenue by Client
**GET** `/api/analytics/revenue/by-client`

Top revenue-generating clients with comparison.

**Query Parameters:**
- `startDate` (required): ISO date
- `endDate` (required): ISO date
- `limit` (optional): Number (1-100)
  - Default: `10`

**Response:**
```json
[
  {
    "clientId": 0,
    "clientName": "",
    "clientEmail": "",
    "revenue": 0,
    "previousRevenue": 0,
    "trend": 0,
    "transactionCount": 0
  }
]
```

---

### 8. Revenue by Project
**GET** `/api/analytics/revenue/by-project`

Project revenue with profitability analysis.

**Query Parameters:**
- `startDate` (required): ISO date
- `endDate` (required): ISO date
- `limit` (optional): Number (1-100)
  - Default: `10`

**Response:**
```json
[
  {
    "projectId": 0,
    "projectName": "",
    "projectStatus": "",
    "clientName": "",
    "revenue": 0,
    "expenses": 0,
    "profit": 0,
    "margin": 0,
    "transactionCount": 0
  }
]
```

---

### 9. Revenue Forecast
**GET** `/api/analytics/revenue/forecast`

AI-powered revenue forecasting using linear regression.

**Query Parameters:**
- `months` (optional): Number (1-12)
  - Default: `3`

**Response:**
```json
{
  "forecast": [{ "period": "", "value": 0, "confidence": "high|medium|low" }],
  "historical": [{ "period": "", "value": 0 }],
  "trend": "increasing|decreasing|stable",
  "averageGrowth": 0
}
```

---

## Expense Analytics

### 10. Expense Trends
**GET** `/api/analytics/expenses/trends`

Expense trends over time.

**Query Parameters:**
- `startDate` (required): ISO date
- `endDate` (required): ISO date
- `groupBy` (optional): `day` | `week` | `month`
  - Default: `day`

**Response:**
```json
{
  "data": [{ "period": "", "value": 0 }],
  "summary": { "total": 0, "count": 0, "average": 0 }
}
```

---

### 11. Expenses by Category
**GET** `/api/analytics/expenses/by-category`

Expense breakdown by category with trends.

**Query Parameters:**
- `startDate` (required): ISO date
- `endDate` (required): ISO date

**Response:**
```json
[
  {
    "category": "",
    "amount": 0,
    "previousAmount": 0,
    "trend": 0,
    "count": 0,
    "percentage": 0
  }
]
```

---

### 12. Expenses by Project
**GET** `/api/analytics/expenses/by-project`

Project expenses with budget tracking.

**Query Parameters:**
- `startDate` (required): ISO date
- `endDate` (required): ISO date
- `limit` (optional): Number (1-100)
  - Default: `10`

**Response:**
```json
[
  {
    "projectId": 0,
    "projectName": "",
    "projectStatus": "",
    "expenses": 0,
    "budget": 0,
    "budgetUsed": 0,
    "count": 0
  }
]
```

---

## Project Analytics

### 13. Project Profitability
**GET** `/api/analytics/projects/profitability`

Comprehensive project profitability analysis.

**Query Parameters:**
- `startDate` (optional): ISO date
- `endDate` (optional): ISO date
- `limit` (optional): Number (1-100)
  - Default: `20`

**Response:**
```json
[
  {
    "id": 0,
    "title": "",
    "clientName": "",
    "status": "",
    "revenue": 0,
    "expenses": 0,
    "profit": 0,
    "margin": 0,
    "budget": 0,
    "budgetUsed": 0,
    "roi": 0
  }
]
```

---

### 14. Project Performance
**GET** `/api/analytics/projects/performance`

Project performance metrics (completion rates, on-time delivery).

**Query Parameters:**
- `startDate` (optional): ISO date
- `endDate` (optional): ISO date

**Response:**
```json
[
  {
    "id": 0,
    "title": "",
    "status": "",
    "totalTasks": 0,
    "completedTasks": 0,
    "completionRate": 0,
    "onTimeRate": 0,
    "startDate": "",
    "deadline": ""
  }
]
```

---

## Team Analytics

### 15. Team Performance
**GET** `/api/analytics/team/performance`

Individual team member performance tracking.

**Query Parameters:**
- `startDate` (required): ISO date
- `endDate` (required): ISO date

**Response:**
```json
[
  {
    "userId": 0,
    "name": "",
    "email": "",
    "role": "",
    "totalTasks": 0,
    "completedTasks": 0,
    "pendingTasks": 0,
    "completionRate": 0,
    "onTimeRate": 0,
    "projectCount": 0
  }
]
```

---

### 16. Team Utilization
**GET** `/api/analytics/team/utilization`

Team workload and utilization tracking.

**Query Parameters:**
- `period` (optional): Same as dashboard period options
  - Default: `month`

**Response:**
```json
[
  {
    "userId": 0,
    "name": "",
    "email": "",
    "role": "",
    "activeTasks": 0,
    "completedTasks": 0,
    "highPriorityTasks": 0,
    "activeProjects": 0,
    "workloadScore": 0,
    "utilization": "high|medium|low"
  }
]
```

---

## Financial Reports

### 17. Profit & Loss Report
**GET** `/api/reports/profit-loss`

Comprehensive P&L report with period breakdown.

**Query Parameters:**
- `startDate` (required): ISO date
- `endDate` (required): ISO date
- `groupBy` (optional): `day` | `week` | `month` | `quarter`
  - Default: `month`

**Response:**
```json
{
  "reportType": "Profit & Loss",
  "period": { "start": "", "end": "" },
  "groupBy": "",
  "summary": { "totalRevenue": 0, "totalExpenses": 0, "grossProfit": 0, "netProfit": 0, "profitMargin": 0 },
  "periodData": [{ "period": "", "revenue": 0, "expenses": 0, "grossProfit": 0, "margin": 0 }],
  "incomeBreakdown": [{ "source": "", "amount": 0, "percentage": 0 }],
  "expenseBreakdown": [{ "category": "", "amount": 0, "percentage": 0 }],
  "generatedAt": ""
}
```

---

### 18. Cash Flow Report
**GET** `/api/reports/cash-flow`

Cash flow report with running balance.

**Query Parameters:**
- `startDate` (required): ISO date
- `endDate` (required): ISO date
- `groupBy` (optional): `day` | `week` | `month`
  - Default: `month`

**Response:**
```json
{
  "reportType": "Cash Flow",
  "period": { "start": "", "end": "" },
  "groupBy": "",
  "summary": { "totalCashIn": 0, "totalCashOut": 0, "netCashFlow": 0, "openingBalance": 0, "closingBalance": 0 },
  "periodData": [{ "period": "", "cashIn": 0, "cashOut": 0, "netCashFlow": 0, "runningBalance": 0 }],
  "generatedAt": ""
}
```

---

### 19. Accounts Receivable Aging
**GET** `/api/reports/accounts-receivable`

AR aging report with 0-30, 31-60, 61-90, 90+ day buckets.

**Query Parameters:** None

**Response:**
```json
{
  "reportType": "Accounts Receivable Aging",
  "generatedAt": "",
  "summary": {
    "totalOutstanding": 0,
    "totalInvoices": 0,
    "current": { "count": 0, "amount": 0, "percentage": 0 },
    "days1to30": { "count": 0, "amount": 0, "percentage": 0 },
    "days31to60": { "count": 0, "amount": 0, "percentage": 0 },
    "days61to90": { "count": 0, "amount": 0, "percentage": 0 },
    "over90Days": { "count": 0, "amount": 0, "percentage": 0 }
  },
  "aging": {
    "current": [],
    "days1to30": [],
    "days31to60": [],
    "days61to90": [],
    "over90Days": []
  }
}
```

---

### 20. Expense Report
**GET** `/api/reports/expenses`

Detailed expense report by category/project.

**Query Parameters:**
- `startDate` (required): ISO date
- `endDate` (required): ISO date
- `category` (optional): Filter by specific category

**Response:**
```json
{
  "reportType": "Expense Report",
  "period": { "start": "", "end": "" },
  "category": "",
  "summary": { "totalExpenses": 0, "totalTransactions": 0, "averageExpense": 0 },
  "byCategory": [{ "category": "", "count": 0, "total": 0, "average": 0, "percentage": 0 }],
  "byProject": [{ "projectId": 0, "projectTitle": "", "count": 0, "total": 0 }],
  "topExpenses": [],
  "generatedAt": ""
}
```

---

### 21. Income Report
**GET** `/api/reports/income`

Detailed income report by source/client.

**Query Parameters:**
- `startDate` (required): ISO date
- `endDate` (required): ISO date
- `source` (optional): Filter by specific source

**Response:**
```json
{
  "reportType": "Income Report",
  "period": { "start": "", "end": "" },
  "source": "",
  "summary": { "totalIncome": 0, "totalTransactions": 0, "averageIncome": 0 },
  "bySource": [{ "source": "", "count": 0, "total": 0, "average": 0, "percentage": 0 }],
  "byClient": [{ "clientId": 0, "clientName": "", "count": 0, "total": 0 }],
  "topTransactions": [],
  "generatedAt": ""
}
```

---

### 22. Custom Report
**POST** `/api/reports/custom`

Build custom reports with user-defined metrics.

**Request Body:**
```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "metrics": ["revenue", "expenses", "projects", "tasks", "invoices"],
  "groupBy": "month",
  "filters": {}
}
```

**Response:**
```json
{
  "reportType": "Custom Report",
  "period": { "start": "", "end": "" },
  "metrics": {
    "revenue": { "total": 0, "count": 0 },
    "expenses": { "total": 0, "count": 0 },
    "projects": { "count": 0 },
    "tasks": { "count": 0 },
    "invoices": { "total": 0, "count": 0 }
  },
  "generatedAt": ""
}
```

---

## Data Exports

### 23. CSV Export
**POST** `/api/exports/csv`

Export data to CSV format.

**Request Body:**
```json
{
  "dataSource": "income|expenses|invoices|projects|proposals|contacts|tasks|leads|team_members",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "filters": {}
}
```

**Response:** File download (CSV)

---

### 24. Excel Export
**POST** `/api/exports/excel`

Export data to Excel format (multi-sheet workbook).

**Request Body:**
```json
{
  "reportType": "financial|projects|analytics|crm",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "filters": {}
}
```

**Response:** File download (XLSX)

---

### 25. Batch Export
**POST** `/api/exports/batch`

Export multiple data sources in one operation.

**Request Body:**
```json
{
  "dataSources": ["income", "expenses", "invoices", "projects"],
  "format": "csv|excel",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Batch export completed successfully",
  "data": {
    "count": 4,
    "files": ["income_123456.csv", "expenses_123456.csv", "..."]
  }
}
```

---

## Authentication

All endpoints require authentication via JWT token:

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

Get token via login:
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

---

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "error": { /* Error details */ }
}
```

Common HTTP Status Codes:
- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

**Total Endpoints: 25** (+ 4 dashboards)  
**All endpoints require authentication**  
**Base URL: `http://localhost:5000/api`**
