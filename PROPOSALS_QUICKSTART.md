# 🚀 Proposals System - Quick Start Guide

A comprehensive guide to using the MediaFlow CRM Proposal System API.

---

## 📋 Table of Contents
1. [Setup](#setup)
2. [Lead Management](#lead-management)
3. [Proposal Creation](#proposal-creation)
4. [PDF Generation](#pdf-generation)
5. [Email Delivery](#email-delivery)
6. [Public Sharing](#public-sharing)
7. [E-Signatures](#e-signatures)
8. [Analytics](#analytics)
9. [Testing Examples](#testing-examples)

---

## 🔧 Setup

### 1. Environment Variables
Add to your `.env` file:

```env
# Required (already set)
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secret-here
DATABASE_URL=your-database-url

# Email Configuration (optional - for sending proposals)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@mediaflow.com
```

### 2. Install Dependencies
```bash
cd backend
npm install nodemailer @types/nodemailer
```

### 3. Database Setup
The proposal tables should already exist from your database migrations. Verify with:
```bash
npx prisma studio
```

Look for these tables:
- `leads`
- `proposals`
- `proposal_items`
- `proposal_signatures`
- `proposal_views`

---

## 🎯 Lead Management

### Create a Lead
```bash
POST /api/proposals/leads
Authorization: Bearer YOUR_JWT_TOKEN

{
  "name": "John Smith",
  "company": "Tech Innovations Inc",
  "email": "john@techinnovations.com",
  "phone": "+1-555-0123",
  "source": "Website",
  "status": "New",
  "estimated_value": 50000,
  "notes": "Interested in video production services"
}
```

### List Leads with Filters
```bash
GET /api/proposals/leads?status=New&source=Website&page=1&limit=20
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `status` - Filter by status (New, Contacted, Qualified, etc.)
- `source` - Filter by source (Website, Referral, etc.)
- `search` - Search by name, company, or email
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

### Get Lead by ID
```bash
GET /api/proposals/leads/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

### Update Lead
```bash
PUT /api/proposals/leads/:id
Authorization: Bearer YOUR_JWT_TOKEN

{
  "status": "Qualified",
  "estimated_value": 75000,
  "notes": "Had a great call, sending proposal"
}
```

### Convert Lead to Client
```bash
POST /api/proposals/leads/:id/convert
Authorization: Bearer YOUR_JWT_TOKEN

{
  "create_project": true,
  "project_name": "Corporate Video Production",
  "project_description": "Q1 2024 promotional video series",
  "project_budget": 75000,
  "project_start_date": "2024-02-01"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "lead": { ... },
    "contact": { ... },
    "project": { ... }
  },
  "message": "Lead converted to client successfully"
}
```

### Get Lead Statistics
```bash
GET /api/proposals/leads/stats
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 45,
    "byStatus": {
      "New": 12,
      "Contacted": 8,
      "Qualified": 10,
      "Proposal Sent": 7,
      "Negotiation": 4,
      "Won": 3,
      "Lost": 1
    },
    "bySource": {
      "Website": 20,
      "Referral": 15,
      "Social Media": 10
    },
    "conversionRate": 6.67,
    "recentLeads": [...]
  }
}
```

### Delete Lead
```bash
DELETE /api/proposals/leads/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

**Note:** Cannot delete converted leads.

---

## 📄 Proposal Creation

### Create a Proposal
```bash
POST /api/proposals
Authorization: Bearer YOUR_JWT_TOKEN

{
  "client_id": "uuid-of-client",
  "title": "Corporate Video Production Proposal",
  "introduction": "Thank you for considering MediaFlow for your video production needs...",
  "scope_of_work": "We will produce 5 high-quality corporate videos...",
  "deliverables": "- 5 edited videos (2-3 minutes each)\n- Raw footage\n- Music licensing",
  "timeline": "Project duration: 6 weeks\nWeek 1-2: Pre-production\nWeek 3-5: Filming\nWeek 6: Post-production",
  "terms": "50% deposit required to begin work. Final payment due upon delivery.",
  "notes": "All filming locations must be provided by client.",
  "valid_until": "2024-03-31",
  "tax_rate": 8.5,
  "discount": 2500,
  "items": [
    {
      "title": "Video Production - 5 videos",
      "description": "Professional 4K video production with 2-camera setup",
      "quantity": 5,
      "unit_price": 15000
    },
    {
      "title": "Script Writing",
      "description": "Professional scriptwriting for all 5 videos",
      "quantity": 5,
      "unit_price": 1000
    },
    {
      "title": "Post-Production & Editing",
      "description": "Color grading, sound design, motion graphics",
      "quantity": 1,
      "unit_price": 8000
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "proposal_number": "PROP-2024-001",
    "title": "Corporate Video Production Proposal",
    "status": "Draft",
    "subtotal": 83000,
    "tax_amount": 7055,
    "discount": 2500,
    "total": 87555,
    "public_token": "abc123xyz789",
    "items": [...],
    "created_at": "2024-01-15T10:00:00Z"
  },
  "message": "Proposal created successfully"
}
```

### List Proposals with Filters
```bash
GET /api/proposals?status=Sent&client_id=uuid&page=1&limit=20
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `status` - Filter by status (Draft, Sent, Viewed, Accepted, Rejected, Expired)
- `client_id` - Filter by client
- `lead_id` - Filter by lead
- `search` - Search by proposal number or title
- `page` - Page number
- `limit` - Items per page

### Get Proposal by ID
```bash
GET /api/proposals/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

### Update Proposal
```bash
PUT /api/proposals/:id
Authorization: Bearer YOUR_JWT_TOKEN

{
  "title": "Updated Proposal Title",
  "discount": 3000,
  "items": [
    {
      "title": "Updated Item",
      "description": "New description",
      "quantity": 2,
      "unit_price": 10000
    }
  ]
}
```

**Note:** Cannot update proposals with status "Accepted" or "Rejected".

### Update Proposal Status
```bash
PATCH /api/proposals/:id/status
Authorization: Bearer YOUR_JWT_TOKEN

{
  "status": "Sent"
}
```

**Valid status transitions:**
- Draft → Sent
- Sent → Viewed
- Viewed → Accepted/Rejected
- Any → Expired (system can do this)

### Get Proposal Statistics
```bash
GET /api/proposals/stats
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 67,
    "byStatus": {
      "Draft": 15,
      "Sent": 20,
      "Viewed": 18,
      "Accepted": 10,
      "Rejected": 3,
      "Expired": 1
    },
    "acceptanceRate": 14.93,
    "totalValue": 1234567.89,
    "averageValue": 18426.98,
    "recentProposals": [...]
  }
}
```

### Delete Proposal
```bash
DELETE /api/proposals/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

**Note:** Cannot delete accepted proposals.

---

## 📑 PDF Generation

### Generate Proposal PDF
```bash
POST /api/proposals/:id/pdf
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pdfUrl": "/uploads/proposals/proposal-PROP-2024-001-1705320000000.html"
  },
  "message": "Proposal PDF generated successfully"
}
```

**Features:**
- Beautiful gradient purple header
- Company branding
- Client information
- All proposal sections
- Detailed line items table
- Financial summary
- E-signature display (if signed)
- Print-optimized styles

**Note:** Currently generates HTML. To convert to PDF, integrate Puppeteer:

```bash
npm install puppeteer
```

Then update the service to convert HTML → PDF.

---

## 📧 Email Delivery

### Send Proposal via Email
```bash
POST /api/proposals/:id/send
Authorization: Bearer YOUR_JWT_TOKEN

{
  "message": "Optional custom message to include in email"
}
```

**What happens:**
1. Proposal status updates to "Sent" (if currently "Draft")
2. Beautiful HTML email is sent to client
3. Email includes public proposal link
4. Email contains proposal summary

**Email includes:**
- Proposal number
- Title
- Total investment
- Valid until date
- Call-to-action button with public link
- Professional MediaFlow branding

**SMTP Setup Required:**
Make sure you've configured SMTP settings in `.env` file.

**For Gmail:**
1. Enable 2-factor authentication
2. Generate an "App Password"
3. Use app password in `SMTP_PASS`

---

## 🔗 Public Sharing

### View Public Proposal (No Auth)
```bash
GET /api/proposals/public/:token
```

**Example:**
```bash
GET /api/proposals/public/abc123xyz789
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "proposal_number": "PROP-2024-001",
    "title": "Corporate Video Production Proposal",
    "introduction": "...",
    "scope_of_work": "...",
    "deliverables": "...",
    "timeline": "...",
    "terms": "...",
    "items": [...],
    "subtotal": 83000,
    "tax_amount": 7055,
    "discount": 2500,
    "total": 87555,
    "valid_until": "2024-03-31",
    "status": "Sent",
    "signature": null,
    "client": {
      "name": "Tech Innovations Inc",
      "email": "john@techinnovations.com"
    }
  }
}
```

**Features:**
- No authentication required
- Automatic view tracking
- Safe data exposure (no sensitive internal data)
- Works with expired proposals (read-only)

---

## ✍️ E-Signatures

### Sign Proposal (No Auth)
```bash
POST /api/proposals/public/:token/sign

{
  "signer_name": "John Smith",
  "signer_email": "john@techinnovations.com",
  "signer_title": "CEO",
  "signer_company": "Tech Innovations Inc",
  "signature_data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "proposal": {
      "id": "uuid",
      "proposal_number": "PROP-2024-001",
      "status": "Accepted",
      "signed_at": "2024-01-15T14:30:00Z"
    },
    "signature": {
      "id": "uuid",
      "signer_name": "John Smith",
      "signer_email": "john@techinnovations.com",
      "signer_title": "CEO",
      "signer_company": "Tech Innovations Inc",
      "signature_data": "data:image/png;base64,...",
      "ip_address": "192.168.1.100",
      "signed_at": "2024-01-15T14:30:00Z"
    }
  },
  "message": "Proposal signed successfully"
}
```

**What happens:**
1. Signature is saved to database
2. Proposal status → "Accepted"
3. IP address is recorded
4. Timestamp is recorded
5. Email notification sent to proposal creator
6. Proposal becomes read-only

**Signature Requirements:**
- `signer_name` - Full name (required)
- `signer_email` - Email address (required, must match proposal recipient)
- `signer_title` - Job title (optional)
- `signer_company` - Company name (optional)
- `signature_data` - Base64 image data (required)

**Security:**
- IP address tracking
- Email validation
- Cannot re-sign accepted proposals
- Cannot sign expired proposals

---

## 📊 Analytics

### Track Proposal Views
```bash
POST /api/proposals/public/:token/track
```

**What happens:**
- IP address recorded
- User agent recorded
- Timestamp recorded
- Status auto-updates to "Viewed" if currently "Sent"

**Note:** This is called automatically when viewing public proposals.

### View Analytics
View analytics through the stats endpoints:

```bash
GET /api/proposals/stats
GET /api/proposals/leads/stats
```

**Metrics tracked:**
- Total proposals/leads
- Status distribution
- Source distribution (leads)
- Acceptance rate (proposals)
- Conversion rate (leads)
- Total value
- Average value
- View counts
- Recent activity

---

## 🧪 Testing Examples

### Complete Workflow Test

#### 1. Create a Lead
```bash
curl -X POST http://localhost:4000/api/proposals/leads \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sarah Johnson",
    "company": "Marketing Pro Inc",
    "email": "sarah@marketingpro.com",
    "phone": "+1-555-9876",
    "source": "Referral",
    "status": "New",
    "estimated_value": 25000
  }'
```

#### 2. Update Lead Status
```bash
curl -X PUT http://localhost:4000/api/proposals/leads/LEAD_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Qualified"
  }'
```

#### 3. Convert Lead to Client
```bash
curl -X POST http://localhost:4000/api/proposals/leads/LEAD_ID/convert \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "create_project": true,
    "project_name": "Marketing Campaign Videos",
    "project_description": "Social media video content",
    "project_budget": 25000
  }'
```

#### 4. Create Proposal
```bash
curl -X POST http://localhost:4000/api/proposals \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "CLIENT_ID_FROM_CONVERSION",
    "title": "Social Media Video Package",
    "introduction": "We are excited to present this proposal...",
    "valid_until": "2024-02-28",
    "tax_rate": 8.5,
    "items": [
      {
        "title": "Social Media Videos (10 pack)",
        "description": "Short-form vertical videos optimized for Instagram/TikTok",
        "quantity": 10,
        "unit_price": 2000
      },
      {
        "title": "Content Strategy Consultation",
        "description": "2-hour strategy session",
        "quantity": 1,
        "unit_price": 500
      }
    ]
  }'
```

#### 5. Generate PDF
```bash
curl -X POST http://localhost:4000/api/proposals/PROPOSAL_ID/pdf \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 6. Send Proposal
```bash
curl -X POST http://localhost:4000/api/proposals/PROPOSAL_ID/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

#### 7. View Public Proposal (No Auth)
```bash
curl http://localhost:4000/api/proposals/public/PUBLIC_TOKEN
```

#### 8. Sign Proposal (No Auth)
```bash
curl -X POST http://localhost:4000/api/proposals/public/PUBLIC_TOKEN/sign \
  -H "Content-Type: application/json" \
  -d '{
    "signer_name": "Sarah Johnson",
    "signer_email": "sarah@marketingpro.com",
    "signer_title": "Marketing Director",
    "signature_data": "data:image/png;base64,iVBORw0KGg..."
  }'
```

#### 9. Check Stats
```bash
curl http://localhost:4000/api/proposals/stats \
  -H "Authorization: Bearer YOUR_TOKEN"

curl http://localhost:4000/api/proposals/leads/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🐛 Troubleshooting

### Email Not Sending
**Problem:** Proposal email fails to send  
**Solution:**
1. Check SMTP configuration in `.env`
2. Verify SMTP credentials
3. For Gmail, use App Password (not regular password)
4. Check firewall settings
5. Check logs: `backend/logs/combined-*.log`

### Public Link Not Working
**Problem:** Public proposal link returns 404  
**Solution:**
1. Verify `public_token` is correct
2. Check proposal exists in database
3. Ensure routes are registered in `app.ts`

### Signature Not Saving
**Problem:** E-signature doesn't save  
**Solution:**
1. Verify `signature_data` is valid base64
2. Check `signer_email` matches proposal recipient
3. Ensure proposal is not expired
4. Ensure proposal is not already signed

### PDF Not Generating
**Problem:** PDF generation fails  
**Solution:**
1. Check `/uploads/proposals/` directory exists
2. Verify file permissions
3. Check disk space
4. Review logs for errors

---

## 📚 Additional Resources

- **Full API Docs**: See `API_DOCS.md`
- **Phase 4 Summary**: See `PHASE_4_COMPLETE.md`
- **Database Schema**: Check `prisma/schema.prisma`
- **Example Frontend**: See `front-end/src/pages/proposals/`

---

## 🎉 Success!

You now have a fully functional proposal system! Your workflow should be:

1. **Capture leads** from various sources
2. **Track & qualify** leads through the pipeline
3. **Convert** qualified leads to clients
4. **Create proposals** with professional formatting
5. **Generate PDFs** for offline sharing
6. **Email proposals** to clients
7. **Track views** and engagement
8. **Capture e-signatures** for legal acceptance
9. **Analyze performance** with built-in statistics

---

**Happy proposing! 🚀**

*Built with ❤️ for MediaFlow CRM*
