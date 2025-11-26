# Phase 5: Analytics & Reporting - Testing Examples

## 🧪 Testing Prerequisites

### 1. Get Authentication Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mediaflow.com",
    "password": "admin123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@mediaflow.com",
      "role": "Admin"
    }
  }
}
```

### 2. Set Token Variable
```bash
# Save token for subsequent requests
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 📊 Dashboard Analytics Tests

### Test 1: Overall Dashboard (Current Month)
```bash
curl -X GET "http://localhost:5000/api/analytics/dashboard?period=month" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Dashboard metrics retrieved successfully",
  "data": {
    "period": "month",
    "dateRange": {
      "start": "2024-12-01T00:00:00.000Z",
      "end": "2024-12-31T23:59:59.999Z"
    },
    "revenue": {
      "current": 125000,
      "previous": 110000,
      "trend": 13.64,
      "count": 45
    },
    "expenses": {
      "current": 75000,
      "previous": 68000,
      "trend": 10.29,
      "count": 120
    },
    "profit": {
      "current": 50000,
      "previous": 42000,
      "margin": 40
    },
    "projects": {
      "active": 8,
      "completed": 3,
      "total": 15,
      "completionRate": 20
    },
    "tasks": {
      "pending": 45,
      "completed": 30,
      "total": 75,
      "completionRate": 40
    },
    "invoices": {
      "outstanding": 35000,
      "outstandingCount": 12,
      "overdue": 8000,
      "overdueCount": 3
    },
    "proposals": {
      "pending": 5,
      "accepted": 2,
      "total": 10,
      "conversionRate": 20
    },
    "leads": {
      "new": 8,
      "converted": 2,
      "total": 25,
      "conversionRate": 25,
      "pipelineValue": 250000
    }
  }
}
```

### Test 2: Revenue Dashboard
```bash
curl -X GET "http://localhost:5000/api/analytics/dashboard/revenue?period=month" \
  -H "Authorization: Bearer $TOKEN"
```

### Test 3: Expense Dashboard
```bash
curl -X GET "http://localhost:5000/api/analytics/dashboard/expenses?period=quarter" \
  -H "Authorization: Bearer $TOKEN"
```

### Test 4: Projects Dashboard
```bash
curl -X GET "http://localhost:5000/api/analytics/dashboard/projects?period=year" \
  -H "Authorization: Bearer $TOKEN"
```

### Test 5: Tasks Dashboard
```bash
curl -X GET "http://localhost:5000/api/analytics/dashboard/tasks?period=week" \
  -H "Authorization: Bearer $TOKEN"
```

## 💰 Revenue Analytics Tests

### Test 6: Revenue Trends
```bash
curl -X GET "http://localhost:5000/api/analytics/revenue/trends?startDate=2024-01-01&endDate=2024-12-31&groupBy=month" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Revenue trends retrieved successfully",
  "data": {
    "data": [
      { "period": "2024-01", "value": 95000, "count": 35, "growth": 0 },
      { "period": "2024-02", "value": 102000, "count": 38, "growth": 7.37 },
      { "period": "2024-03", "value": 115000, "count": 42, "growth": 12.75 }
    ],
    "summary": {
      "total": 1450000,
      "count": 485,
      "average": 2989.69
    }
  }
}
```

### Test 7: Revenue by Client
```bash
curl -X GET "http://localhost:5000/api/analytics/revenue/by-client?startDate=2024-01-01&endDate=2024-12-31&limit=5" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Revenue by client retrieved successfully",
  "data": [
    {
      "clientId": 5,
      "clientName": "Tech Corp Inc",
      "clientEmail": "contact@techcorp.com",
      "revenue": 450000,
      "previousRevenue": 380000,
      "trend": 18.42,
      "transactionCount": 85
    },
    {
      "clientId": 12,
      "clientName": "Digital Agency",
      "clientEmail": "hello@digitalagency.com",
      "revenue": 320000,
      "previousRevenue": 290000,
      "trend": 10.34,
      "transactionCount": 62
    }
  ]
}
```

### Test 8: Revenue by Project
```bash
curl -X GET "http://localhost:5000/api/analytics/revenue/by-project?startDate=2024-01-01&endDate=2024-12-31&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### Test 9: Revenue Forecast
```bash
curl -X GET "http://localhost:5000/api/analytics/revenue/forecast?months=6" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Revenue forecast retrieved successfully",
  "data": {
    "forecast": [
      { "period": "2025-01", "value": 128000, "confidence": "high" },
      { "period": "2025-02", "value": 132000, "confidence": "high" },
      { "period": "2025-03", "value": 136000, "confidence": "high" },
      { "period": "2025-04", "value": 140000, "confidence": "medium" },
      { "period": "2025-05", "value": 144000, "confidence": "medium" },
      { "period": "2025-06", "value": 148000, "confidence": "medium" }
    ],
    "historical": [
      { "period": "2024-01", "value": 95000 },
      { "period": "2024-02", "value": 102000 }
    ],
    "trend": "increasing",
    "averageGrowth": 3500
  }
}
```

## 💸 Expense Analytics Tests

### Test 10: Expense Trends
```bash
curl -X GET "http://localhost:5000/api/analytics/expenses/trends?startDate=2024-01-01&endDate=2024-12-31&groupBy=month" \
  -H "Authorization: Bearer $TOKEN"
```

### Test 11: Expenses by Category
```bash
curl -X GET "http://localhost:5000/api/analytics/expenses/by-category?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Expenses by category retrieved successfully",
  "data": [
    {
      "category": "Software",
      "amount": 125000,
      "previousAmount": 110000,
      "trend": 13.64,
      "count": 245,
      "percentage": 32.5
    },
    {
      "category": "Marketing",
      "amount": 85000,
      "previousAmount": 78000,
      "trend": 8.97,
      "count": 156,
      "percentage": 22.1
    },
    {
      "category": "Travel",
      "amount": 45000,
      "previousAmount": 52000,
      "trend": -13.46,
      "count": 89,
      "percentage": 11.7
    }
  ]
}
```

### Test 12: Expenses by Project
```bash
curl -X GET "http://localhost:5000/api/analytics/expenses/by-project?startDate=2024-01-01&endDate=2024-12-31&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

## 🎯 Project Analytics Tests

### Test 13: Project Profitability
```bash
curl -X GET "http://localhost:5000/api/analytics/projects/profitability?startDate=2024-01-01&endDate=2024-12-31&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Project profitability retrieved successfully",
  "data": [
    {
      "id": 8,
      "title": "E-commerce Platform",
      "clientName": "Tech Corp Inc",
      "status": "In Progress",
      "revenue": 180000,
      "expenses": 95000,
      "profit": 85000,
      "margin": 47.22,
      "budget": 150000,
      "budgetUsed": 63.33,
      "roi": 89.47
    },
    {
      "id": 12,
      "title": "Mobile App Development",
      "clientName": "Digital Agency",
      "status": "Completed",
      "revenue": 120000,
      "expenses": 70000,
      "profit": 50000,
      "margin": 41.67,
      "budget": 100000,
      "budgetUsed": 70.0,
      "roi": 71.43
    }
  ]
}
```

### Test 14: Project Performance
```bash
curl -X GET "http://localhost:5000/api/analytics/projects/performance?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer $TOKEN"
```

## 👥 Team Analytics Tests

### Test 15: Team Performance
```bash
curl -X GET "http://localhost:5000/api/analytics/team/performance?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Team performance retrieved successfully",
  "data": [
    {
      "userId": 3,
      "name": "John Developer",
      "email": "john@mediaflow.com",
      "role": "Developer",
      "totalTasks": 45,
      "completedTasks": 38,
      "pendingTasks": 7,
      "completionRate": 84.44,
      "onTimeRate": 92.11,
      "projectCount": 5
    },
    {
      "userId": 5,
      "name": "Sarah Designer",
      "email": "sarah@mediaflow.com",
      "role": "Designer",
      "totalTasks": 32,
      "completedTasks": 28,
      "pendingTasks": 4,
      "completionRate": 87.5,
      "onTimeRate": 96.43,
      "projectCount": 4
    }
  ]
}
```

### Test 16: Team Utilization
```bash
curl -X GET "http://localhost:5000/api/analytics/team/utilization?period=month" \
  -H "Authorization: Bearer $TOKEN"
```

## 📋 Financial Reports Tests

### Test 17: Profit & Loss Report
```bash
curl -X GET "http://localhost:5000/api/reports/profit-loss?startDate=2024-01-01&endDate=2024-12-31&groupBy=month" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Profit & Loss report generated successfully",
  "data": {
    "reportType": "Profit & Loss",
    "period": { "start": "2024-01-01", "end": "2024-12-31" },
    "groupBy": "month",
    "summary": {
      "totalRevenue": 1450000,
      "totalExpenses": 875000,
      "grossProfit": 575000,
      "netProfit": 575000,
      "profitMargin": 39.66
    },
    "periodData": [
      {
        "period": "2024-01",
        "revenue": 95000,
        "expenses": 58000,
        "grossProfit": 37000,
        "margin": 38.95
      },
      {
        "period": "2024-02",
        "revenue": 102000,
        "expenses": 62000,
        "grossProfit": 40000,
        "margin": 39.22
      }
    ],
    "incomeBreakdown": [
      { "source": "Project", "amount": 1200000, "percentage": 82.76 },
      { "source": "Consulting", "amount": 150000, "percentage": 10.34 },
      { "source": "Subscription", "amount": 100000, "percentage": 6.90 }
    ],
    "expenseBreakdown": [
      { "category": "Software", "amount": 285000, "percentage": 32.57 },
      { "category": "Marketing", "amount": 220000, "percentage": 25.14 },
      { "category": "Travel", "amount": 175000, "percentage": 20.00 }
    ],
    "generatedAt": "2024-12-15T10:30:00.000Z"
  }
}
```

### Test 18: Cash Flow Report
```bash
curl -X GET "http://localhost:5000/api/reports/cash-flow?startDate=2024-01-01&endDate=2024-12-31&groupBy=month" \
  -H "Authorization: Bearer $TOKEN"
```

### Test 19: Accounts Receivable Aging
```bash
curl -X GET "http://localhost:5000/api/reports/accounts-receivable" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Accounts Receivable report generated successfully",
  "data": {
    "reportType": "Accounts Receivable Aging",
    "generatedAt": "2024-12-15T10:30:00.000Z",
    "summary": {
      "totalOutstanding": 145000,
      "totalInvoices": 35,
      "current": { "count": 18, "amount": 85000, "percentage": 58.62 },
      "days1to30": { "count": 8, "amount": 35000, "percentage": 24.14 },
      "days31to60": { "count": 5, "amount": 15000, "percentage": 10.34 },
      "days61to90": { "count": 2, "amount": 7000, "percentage": 4.83 },
      "over90Days": { "count": 2, "amount": 3000, "percentage": 2.07 }
    },
    "aging": {
      "current": [
        {
          "invoiceId": 125,
          "invoiceNumber": "INV-2024-125",
          "clientName": "Tech Corp Inc",
          "projectTitle": "E-commerce Platform",
          "amount": 25000,
          "dueDate": "2024-12-20",
          "daysOverdue": 0,
          "status": "Sent"
        }
      ],
      "days1to30": [],
      "days31to60": [],
      "days61to90": [],
      "over90Days": []
    }
  }
}
```

### Test 20: Expense Report
```bash
curl -X GET "http://localhost:5000/api/reports/expenses?startDate=2024-01-01&endDate=2024-12-31&category=Software" \
  -H "Authorization: Bearer $TOKEN"
```

### Test 21: Income Report
```bash
curl -X GET "http://localhost:5000/api/reports/income?startDate=2024-01-01&endDate=2024-12-31&source=Project" \
  -H "Authorization: Bearer $TOKEN"
```

### Test 22: Custom Report
```bash
curl -X POST "http://localhost:5000/api/reports/custom" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "metrics": ["revenue", "expenses", "projects", "tasks"],
    "groupBy": "month"
  }'
```

## 💾 Data Export Tests

### Test 23: CSV Export - Income
```bash
curl -X POST "http://localhost:5000/api/exports/csv" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dataSource": "income",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  }' \
  --output income_export.csv
```

### Test 24: CSV Export - Expenses
```bash
curl -X POST "http://localhost:5000/api/exports/csv" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dataSource": "expenses",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  }' \
  --output expenses_export.csv
```

### Test 25: Excel Export - Financial Report
```bash
curl -X POST "http://localhost:5000/api/exports/excel" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reportType": "financial",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  }' \
  --output financial_report.xlsx
```

### Test 26: Excel Export - Project Report
```bash
curl -X POST "http://localhost:5000/api/exports/excel" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reportType": "projects",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  }' \
  --output project_report.xlsx
```

### Test 27: Excel Export - Analytics Report
```bash
curl -X POST "http://localhost:5000/api/exports/excel" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reportType": "analytics",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  }' \
  --output analytics_report.xlsx
```

### Test 28: Batch Export
```bash
curl -X POST "http://localhost:5000/api/exports/batch" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dataSources": ["income", "expenses", "invoices", "projects"],
    "format": "csv",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  }'
```

## 🧪 Advanced Testing Scenarios

### Scenario 1: Quarter-over-Quarter Analysis
```bash
# Q1 2024
curl -X GET "http://localhost:5000/api/analytics/revenue/trends?startDate=2024-01-01&endDate=2024-03-31&groupBy=month" \
  -H "Authorization: Bearer $TOKEN"

# Q2 2024
curl -X GET "http://localhost:5000/api/analytics/revenue/trends?startDate=2024-04-01&endDate=2024-06-30&groupBy=month" \
  -H "Authorization: Bearer $TOKEN"
```

### Scenario 2: Year-over-Year Comparison
```bash
# 2023
curl -X GET "http://localhost:5000/api/analytics/dashboard?period=year" \
  -H "Authorization: Bearer $TOKEN"

# 2024
curl -X GET "http://localhost:5000/api/analytics/dashboard?period=year" \
  -H "Authorization: Bearer $TOKEN"
```

### Scenario 3: Client Profitability Analysis
```bash
# 1. Get top revenue clients
curl -X GET "http://localhost:5000/api/analytics/revenue/by-client?startDate=2024-01-01&endDate=2024-12-31&limit=10" \
  -H "Authorization: Bearer $TOKEN"

# 2. Get expense by project for those clients
curl -X GET "http://localhost:5000/api/analytics/expenses/by-project?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer $TOKEN"

# 3. Calculate profit per client
curl -X GET "http://localhost:5000/api/analytics/projects/profitability?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer $TOKEN"
```

## ✅ Expected Test Results

### Success Indicators
- ✅ All requests return 200 OK
- ✅ Response time < 2 seconds (with caching)
- ✅ Data is accurate and complete
- ✅ Trends show correct calculations
- ✅ Exports download successfully
- ✅ Cache headers present in responses

### Performance Benchmarks
- Dashboard load: < 2 seconds
- Analytics queries: < 500ms
- Report generation: < 3 seconds
- CSV export: < 1 second (1000 records)
- Excel export: < 5 seconds (multi-sheet)

## 🔍 Validation Checklist

- [ ] Authentication works with valid token
- [ ] 401 error with invalid/missing token
- [ ] Date validation (start < end)
- [ ] Period validation (valid values only)
- [ ] GroupBy validation (day/week/month/quarter/year)
- [ ] Limit validation (1-100)
- [ ] Data source validation (valid sources only)
- [ ] Report type validation (valid types only)
- [ ] Cache headers present
- [ ] Export files downloadable
- [ ] Auto-cleanup after download

---

**Test Suite Complete**: 28+ Tests  
**Coverage**: All 29 API Endpoints  
**Status**: ✅ Ready for Testing
