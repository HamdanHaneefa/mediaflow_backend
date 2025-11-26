# 💰 Phase 3: Accounting System Quick Start

## 🚀 Getting Started

### 1. Server Should Already Be Running
If not:
```bash
cd backend
npm run dev
```

### 2. Get an Auth Token
```bash
# Login to get token
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'

# Save the accessToken from response
export TOKEN="your-access-token-here"
```

---

## 💸 Testing Expenses

### Create an Expense
```bash
curl -X POST http://localhost:4000/api/accounting/expenses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Camera Equipment Purchase",
    "description": "Sony A7S III camera body",
    "amount": 3498.00,
    "category": "Equipment",
    "date": "2025-01-15T00:00:00.000Z",
    "notes": "For commercial production team",
    "tags": ["camera", "equipment", "production"]
  }'
```

### List Expenses
```bash
# All expenses
curl http://localhost:4000/api/accounting/expenses \
  -H "Authorization: Bearer $TOKEN"

# Filter by status
curl "http://localhost:4000/api/accounting/expenses?status=Pending" \
  -H "Authorization: Bearer $TOKEN"

# Search
curl "http://localhost:4000/api/accounting/expenses?search=camera" \
  -H "Authorization: Bearer $TOKEN"
```

### Approve an Expense
```bash
curl -X PATCH http://localhost:4000/api/accounting/expenses/EXPENSE_ID/approve \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Approved",
    "notes": "Approved for Q1 budget"
  }'
```

### Get Expense Statistics
```bash
curl http://localhost:4000/api/accounting/expenses/stats \
  -H "Authorization: Bearer $TOKEN"
```

---

## 💵 Testing Income

### Create Income
```bash
curl -X POST http://localhost:4000/api/accounting/income \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Project Milestone Payment",
    "description": "50% advance for corporate video",
    "amount": 25000.00,
    "category": "Milestone",
    "date": "2025-01-20T00:00:00.000Z",
    "payment_method": "Bank Transfer",
    "reference": "TXN-2025-001",
    "notes": "First milestone received"
  }'
```

### List Income
```bash
# All income
curl http://localhost:4000/api/accounting/income \
  -H "Authorization: Bearer $TOKEN"

# Filter by category
curl "http://localhost:4000/api/accounting/income?category=Milestone" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Income Statistics
```bash
curl http://localhost:4000/api/accounting/income/stats \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📄 Testing Invoices

### Create Invoice (with Client ID)
First, get a client ID:
```bash
# List contacts to get a client ID
curl http://localhost:4000/api/contacts \
  -H "Authorization: Bearer $TOKEN"

# Create invoice
curl -X POST http://localhost:4000/api/accounting/invoices \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "invoice_number": "INV-2025-001",
    "client_id": "CLIENT_ID_HERE",
    "issue_date": "2025-01-25T00:00:00.000Z",
    "due_date": "2025-02-25T00:00:00.000Z",
    "status": "Draft",
    "subtotal": 50000,
    "tax_rate": 10,
    "tax_amount": 5000,
    "discount": 0,
    "total": 55000,
    "notes": "Thank you for your business!",
    "terms": "Payment due within 30 days.",
    "items": [
      {
        "description": "Corporate Video Production",
        "quantity": 1,
        "unit_price": 30000,
        "amount": 30000
      },
      {
        "description": "Post-Production & Editing",
        "quantity": 1,
        "unit_price": 15000,
        "amount": 15000
      },
      {
        "description": "Color Grading",
        "quantity": 1,
        "unit_price": 5000,
        "amount": 5000
      }
    ]
  }'
```

### List Invoices
```bash
# All invoices
curl http://localhost:4000/api/accounting/invoices \
  -H "Authorization: Bearer $TOKEN"

# Filter by status
curl "http://localhost:4000/api/accounting/invoices?status=Draft" \
  -H "Authorization: Bearer $TOKEN"
```

### Generate Invoice PDF
```bash
curl http://localhost:4000/api/accounting/invoices/INVOICE_ID/pdf \
  -H "Authorization: Bearer $TOKEN"

# The response will include a URL to the generated invoice
# Open it in browser: http://localhost:4000/uploads/invoices/invoice-XXX.html
```

### Update Invoice Status
```bash
curl -X PATCH http://localhost:4000/api/accounting/invoices/INVOICE_ID/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Sent"
  }'

# Mark as paid
curl -X PATCH http://localhost:4000/api/accounting/invoices/INVOICE_ID/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Paid"
  }'
```

### Get Invoice Statistics
```bash
curl http://localhost:4000/api/accounting/invoices/stats \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 Testing Financial Reports

### Get Financial Dashboard
```bash
# All time
curl http://localhost:4000/api/accounting/reports/dashboard \
  -H "Authorization: Bearer $TOKEN"

# Date range
curl "http://localhost:4000/api/accounting/reports/dashboard?start_date=2025-01-01T00:00:00.000Z&end_date=2025-12-31T23:59:59.999Z" \
  -H "Authorization: Bearer $TOKEN"

# Project specific
curl "http://localhost:4000/api/accounting/reports/dashboard?project_id=PROJECT_ID" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Profit & Loss Report
```bash
curl "http://localhost:4000/api/accounting/reports/profit-loss?start_date=2025-01-01T00:00:00.000Z&end_date=2025-12-31T23:59:59.999Z" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔄 Complete Workflow Example

### 1. Create a Project (if needed)
```bash
curl -X POST http://localhost:4000/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Corporate Video 2025",
    "type": "Commercial",
    "status": "Active",
    "budget": 50000
  }'
```

### 2. Add Expenses to Project
```bash
curl -X POST http://localhost:4000/api/accounting/expenses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Camera Rental",
    "amount": 1500,
    "category": "Equipment",
    "project_id": "PROJECT_ID"
  }'
```

### 3. Approve Expenses
```bash
curl -X PATCH http://localhost:4000/api/accounting/expenses/EXPENSE_ID/approve \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "Approved"}'
```

### 4. Create Invoice for Client
```bash
curl -X POST http://localhost:4000/api/accounting/invoices \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "invoice_number": "INV-2025-001",
    "client_id": "CLIENT_ID",
    "project_id": "PROJECT_ID",
    "issue_date": "2025-01-25T00:00:00.000Z",
    "due_date": "2025-02-25T00:00:00.000Z",
    "subtotal": 50000,
    "tax_rate": 10,
    "total": 55000,
    "items": [...]
  }'
```

### 5. Generate PDF
```bash
curl http://localhost:4000/api/accounting/invoices/INVOICE_ID/pdf \
  -H "Authorization: Bearer $TOKEN"
```

### 6. Record Payment
```bash
# Mark invoice as paid
curl -X PATCH http://localhost:4000/api/accounting/invoices/INVOICE_ID/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "Paid"}'

# Record income
curl -X POST http://localhost:4000/api/accounting/income \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Invoice Payment",
    "amount": 55000,
    "category": "Project Payment",
    "project_id": "PROJECT_ID",
    "client_id": "CLIENT_ID",
    "invoice_id": "INVOICE_ID",
    "payment_method": "Bank Transfer"
  }'
```

### 7. Check Profitability
```bash
curl "http://localhost:4000/api/accounting/reports/dashboard?project_id=PROJECT_ID" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🎯 Common Scenarios

### Scenario 1: Equipment Purchase
```bash
# 1. Submit expense
# 2. Manager approves
# 3. Check expense stats
```

### Scenario 2: Client Invoice
```bash
# 1. Create invoice with items
# 2. Generate PDF
# 3. Update status to "Sent"
# 4. When paid, update to "Paid"
# 5. Record income
```

### Scenario 3: Monthly Financial Review
```bash
# 1. Get dashboard for the month
# 2. Get profit & loss report
# 3. Check expense breakdown
# 4. Check income breakdown
# 5. Review overdue invoices
```

---

## 📝 Response Examples

### Expense Response
```json
{
  "success": true,
  "message": "Expense created successfully",
  "data": {
    "id": "uuid",
    "title": "Camera Equipment Purchase",
    "description": "Sony A7S III camera body",
    "amount": 3498.00,
    "category": "Equipment",
    "status": "Pending",
    "date": "2025-01-15T00:00:00.000Z",
    "project": { ... },
    "creator": { ... },
    "created_at": "2025-01-15T10:30:00.000Z"
  }
}
```

### Financial Dashboard Response
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_income": 150000,
      "total_expenses": 45000,
      "profit": 105000,
      "profit_margin": 70
    },
    "expenses": {
      "by_status": [...],
      "by_category": [...],
      "totals": { "count": 25, "total_amount": 45000 }
    },
    "income": {
      "by_category": [...],
      "by_payment_method": [...],
      "totals": { "count": 15, "total_amount": 150000 }
    }
  }
}
```

---

## 🐛 Troubleshooting

### "Expense not found"
- Check that you're using a valid expense ID
- Verify you have access to this expense

### "Cannot update expense that has been approved"
- Expenses are locked after approval
- Create a new expense if needed

### "Cannot delete paid invoice"
- Paid invoices are locked for data integrity
- Change status to "Cancelled" instead

### "Client not found"
- Verify client_id exists in contacts table
- Client must have role="Client"

---

## 💡 Pro Tips

1. **Use project association** for better profitability tracking
2. **Approve expenses promptly** to maintain accurate financials
3. **Generate invoice PDFs** before sending to clients
4. **Track payment methods** for reconciliation
5. **Use date ranges** in reports for period analysis
6. **Check stats endpoints** for dashboard widgets
7. **Update invoice status** to track payment lifecycle

---

## 🎉 What's Next?

Phase 3 is complete! You now have:
- ✅ Full expense management
- ✅ Income tracking
- ✅ Professional invoicing
- ✅ Financial reporting

**Next Phase:** Proposal System with PDF generation and e-signatures! 🚀

---

Need help? Refer to the full documentation in `PHASE_3_COMPLETE.md`
