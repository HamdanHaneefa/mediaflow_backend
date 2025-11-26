# MediaFlow CRM - Backend Implementation Plan

## 🎯 Project Overview

**Target**: Production-ready Node.js/Express backend for a medium-scale media production CRM
**Timeline**: 1-3 months full development
**Deployment**: Self-hosted VPS
**Database**: PostgreSQL (migrating from Supabase)
**Priority Features**: Accounting/Invoicing, Proposal Generation (PDF), Advanced Analytics

---

## 📋 Table of Contents

1. [Technology Stack](#technology-stack)
2. [Architecture Overview](#architecture-overview)
3. [Folder Structure](#folder-structure)
4. [Database Migration Strategy](#database-migration-strategy)
5. [Implementation Phases](#implementation-phases)
6. [API Endpoints Specification](#api-endpoints-specification)
7. [Security Implementation](#security-implementation)
8. [Deployment Configuration](#deployment-configuration)
9. [Development Roadmap](#development-roadmap)

---

## 🛠 Technology Stack

### Core Backend
- **Runtime**: Node.js v20+ (LTS)
- **Framework**: Express.js v4.18+
- **Language**: TypeScript v5+
- **Database**: PostgreSQL v15+
- **ORM**: Prisma v5+ (type-safe, excellent migrations)
- **Validation**: Zod (schema validation)

### Authentication & Security
- **JWT**: jsonwebtoken + bcryptjs
- **Password Hashing**: bcrypt (10 rounds minimum)
- **Rate Limiting**: express-rate-limit
- **Security Headers**: helmet
- **CORS**: cors middleware
- **Input Sanitization**: express-validator

### File Processing (Priority Feature)
- **Upload Handler**: multer
- **Image Processing**: sharp
- **PDF Generation**: puppeteer + handlebars
- **Storage**: AWS S3 or local filesystem with nginx
- **Video Processing**: fluent-ffmpeg (thumbnail generation)

### Email & Notifications
- **Email Service**: nodemailer
- **Email Provider**: SendGrid or AWS SES
- **Templates**: handlebars
- **Queue**: Bull + Redis (for background jobs)

### Analytics & Reporting (Priority Feature)
- **PDF Generation**: puppeteer + pdfkit
- **Excel Export**: exceljs
- **CSV Export**: fast-csv
- **Data Aggregation**: Raw SQL + Prisma
- **Caching**: Redis

### Development Tools
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest
- **Linting**: ESLint + Prettier
- **Process Manager**: PM2
- **Logging**: Winston + Morgan
- **Monitoring**: PM2 + Custom health checks

### DevOps
- **Reverse Proxy**: Nginx
- **SSL**: Let's Encrypt (Certbot)
- **Database Backups**: pg_dump automated scripts
- **Environment**: dotenv
- **Container**: Docker (optional, recommended)

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT (React)                          │
│                   (Port: 3000/80/443)                        │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTPS/REST API
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    NGINX (Reverse Proxy)                     │
│  • SSL Termination  • Rate Limiting  • Static Files         │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                 EXPRESS.JS BACKEND (Port: 4000)              │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │ Auth Layer   │  │  Validation  │  │  Rate Limiting  │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              API Routes                               │   │
│  │  • /api/auth          • /api/proposals (PDF Gen)     │   │
│  │  • /api/contacts      • /api/accounting (Invoicing)  │   │
│  │  • /api/projects      • /api/analytics (Reports)     │   │
│  │  • /api/tasks         • /api/reports (CSV/PDF)       │   │
│  │  • /api/team          • /api/files (Upload)          │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Business Logic Services                  │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Prisma ORM Layer                         │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐  ┌──────────────────┐  ┌──────────────┐
│  PostgreSQL   │  │  Redis (Cache)   │  │  File Store  │
│  (Port: 5432) │  │  (Port: 6379)    │  │  (S3/Local)  │
└───────────────┘  └──────────────────┘  └──────────────┘
        │
        ▼
┌───────────────┐
│  Bull Queue   │
│  (Background  │
│   Jobs)       │
└───────────────┘
```

**Key Components:**

1. **API Gateway**: Express.js with middleware stack
2. **Database Layer**: Prisma ORM connecting to PostgreSQL
3. **Cache Layer**: Redis for sessions, rate limiting, and data caching
4. **File Storage**: AWS S3 or local filesystem with CDN
5. **Background Jobs**: Bull queue for emails, PDF generation, analytics
6. **Monitoring**: Health checks, logging, and metrics

---

## 📁 Folder Structure

```
backend/
├── src/
│   ├── config/                      # Configuration files
│   │   ├── database.ts              # Database connection config
│   │   ├── redis.ts                 # Redis connection config
│   │   ├── s3.ts                    # S3/storage config
│   │   ├── email.ts                 # Email service config
│   │   └── app.ts                   # App-level config
│   │
│   ├── middleware/                  # Express middlewares
│   │   ├── auth.middleware.ts       # JWT authentication
│   │   ├── validation.middleware.ts # Request validation
│   │   ├── error.middleware.ts      # Error handling
│   │   ├── rateLimit.middleware.ts  # Rate limiting
│   │   ├── upload.middleware.ts     # File upload handling
│   │   └── permission.middleware.ts # Role-based access control
│   │
│   ├── routes/                      # API routes
│   │   ├── index.ts                 # Route aggregator
│   │   ├── auth.routes.ts           # Authentication routes
│   │   ├── contacts.routes.ts       # Contacts CRUD
│   │   ├── projects.routes.ts       # Projects CRUD
│   │   ├── tasks.routes.ts          # Tasks CRUD
│   │   ├── team.routes.ts           # Team management
│   │   ├── accounting.routes.ts     # 🔥 Expenses/Income/Invoices
│   │   ├── proposals.routes.ts      # 🔥 Proposals + PDF generation
│   │   ├── analytics.routes.ts      # 🔥 Analytics endpoints
│   │   ├── reports.routes.ts        # 🔥 Report generation
│   │   ├── files.routes.ts          # File upload/management
│   │   ├── calendar.routes.ts       # Events and scheduling
│   │   └── notifications.routes.ts  # Notifications
│   │
│   ├── controllers/                 # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── contacts.controller.ts
│   │   ├── projects.controller.ts
│   │   ├── tasks.controller.ts
│   │   ├── team.controller.ts
│   │   ├── accounting.controller.ts # 🔥 Priority
│   │   ├── proposals.controller.ts  # 🔥 Priority
│   │   ├── analytics.controller.ts  # 🔥 Priority
│   │   ├── reports.controller.ts    # 🔥 Priority
│   │   ├── files.controller.ts
│   │   ├── calendar.controller.ts
│   │   └── notifications.controller.ts
│   │
│   ├── services/                    # Business logic
│   │   ├── auth.service.ts
│   │   ├── contacts.service.ts
│   │   ├── projects.service.ts
│   │   ├── tasks.service.ts
│   │   ├── team.service.ts
│   │   ├── accounting.service.ts    # 🔥 Financial calculations
│   │   ├── proposals.service.ts     # 🔥 Proposal logic
│   │   ├── pdf.service.ts           # 🔥 PDF generation
│   │   ├── analytics.service.ts     # 🔥 Data aggregation
│   │   ├── reports.service.ts       # 🔥 Report generation
│   │   ├── email.service.ts
│   │   ├── upload.service.ts
│   │   ├── calendar.service.ts
│   │   └── notification.service.ts
│   │
│   ├── repositories/                # Database access layer
│   │   ├── contact.repository.ts
│   │   ├── project.repository.ts
│   │   ├── task.repository.ts
│   │   ├── team.repository.ts
│   │   ├── accounting.repository.ts
│   │   ├── proposal.repository.ts
│   │   └── analytics.repository.ts
│   │
│   ├── validators/                  # Zod schemas for validation
│   │   ├── auth.validator.ts
│   │   ├── contact.validator.ts
│   │   ├── project.validator.ts
│   │   ├── task.validator.ts
│   │   ├── accounting.validator.ts
│   │   └── proposal.validator.ts
│   │
│   ├── types/                       # TypeScript type definitions
│   │   ├── express.d.ts             # Express type extensions
│   │   ├── auth.types.ts
│   │   ├── api.types.ts
│   │   └── common.types.ts
│   │
│   ├── utils/                       # Utility functions
│   │   ├── logger.ts                # Winston logger
│   │   ├── errors.ts                # Custom error classes
│   │   ├── response.ts              # Standard API responses
│   │   ├── pagination.ts            # Pagination helpers
│   │   ├── crypto.ts                # Encryption utilities
│   │   └── date.ts                  # Date formatting
│   │
│   ├── jobs/                        # Background jobs (Bull)
│   │   ├── email.job.ts             # Email sending queue
│   │   ├── pdf.job.ts               # PDF generation queue
│   │   ├── analytics.job.ts         # Analytics calculation
│   │   └── cleanup.job.ts           # Cleanup old data
│   │
│   ├── templates/                   # Email & PDF templates
│   │   ├── emails/
│   │   │   ├── welcome.hbs
│   │   │   ├── task-assignment.hbs
│   │   │   ├── proposal-sent.hbs
│   │   │   └── invoice.hbs
│   │   └── pdfs/
│   │       ├── proposal.hbs         # 🔥 Proposal template
│   │       ├── invoice.hbs          # 🔥 Invoice template
│   │       └── report.hbs           # 🔥 Report template
│   │
│   ├── scripts/                     # Utility scripts
│   │   ├── seed.ts                  # Database seeding
│   │   ├── migrate.ts               # Migration helper
│   │   └── backup.ts                # Backup script
│   │
│   ├── prisma/                      # Prisma ORM files
│   │   ├── schema.prisma            # Database schema
│   │   ├── seed.ts                  # Seed data
│   │   └── migrations/              # Migration files
│   │
│   ├── app.ts                       # Express app setup
│   └── server.ts                    # Server entry point
│
├── tests/                           # Test files
│   ├── unit/                        # Unit tests
│   ├── integration/                 # Integration tests
│   └── e2e/                         # End-to-end tests
│
├── uploads/                         # Local file storage (dev)
│   ├── temp/                        # Temporary uploads
│   ├── assets/                      # Asset files
│   └── documents/                   # Generated documents
│
├── logs/                            # Application logs
│   ├── error.log
│   ├── combined.log
│   └── access.log
│
├── docs/                            # Documentation
│   ├── API.md                       # API documentation
│   ├── DEPLOYMENT.md                # Deployment guide
│   └── CONTRIBUTING.md              # Development guide
│
├── .env.example                     # Environment variables template
├── .env                             # Environment variables (gitignored)
├── .gitignore                       # Git ignore file
├── .eslintrc.js                     # ESLint configuration
├── .prettierrc                      # Prettier configuration
├── tsconfig.json                    # TypeScript configuration
├── package.json                     # Dependencies
├── ecosystem.config.js              # PM2 configuration
├── docker-compose.yml               # Docker setup (optional)
├── Dockerfile                       # Docker image
└── README.md                        # Project documentation
```

---

## 🔄 Database Migration Strategy

### Phase 1: Supabase to PostgreSQL Migration

Since you want to move from Supabase to pure PostgreSQL, here's the migration approach:

**Option A: Use Existing Supabase Migrations (Recommended)**
Your Supabase migrations are already PostgreSQL-compatible! Just:
1. Copy migration files from `front-end/supabase/migrations/` to `backend/prisma/migrations/`
2. Run them against your new PostgreSQL database
3. Prisma will introspect the existing schema

**Option B: Generate Prisma Schema from Scratch**
1. Create Prisma schema manually based on your types
2. Let Prisma handle migrations going forward

**Recommendation**: Use Option A - your migrations are excellent and comprehensive.

### Migration Checklist

```bash
# 1. Setup PostgreSQL on VPS
sudo apt install postgresql postgresql-contrib

# 2. Create database
sudo -u postgres psql
CREATE DATABASE mediaflow_crm;
CREATE USER mediaflow WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE mediaflow_crm TO mediaflow;

# 3. Run existing migrations
psql -U mediaflow -d mediaflow_crm -f migration_file.sql

# 4. Introspect with Prisma
npx prisma db pull

# 5. Generate Prisma Client
npx prisma generate
```

### Key Changes Needed

**Remove Supabase-specific features:**
- `auth.users` references → Replace with local `users` table
- RLS policies → Implement in application layer (middleware)
- Supabase Storage → Replace with S3 or local filesystem
- Supabase Realtime → Implement WebSocket server (Socket.io) if needed

---

## 🚀 Implementation Phases

### **PHASE 1: Core Infrastructure (Week 1-2)**

**Goal**: Set up project foundation and basic CRUD

**Tasks:**
1. ✅ Initialize Node.js + TypeScript project
2. ✅ Setup Express server with basic middleware
3. ✅ Configure PostgreSQL + Prisma ORM
4. ✅ Implement authentication system (JWT)
5. ✅ Create base repository pattern
6. ✅ Setup logging and error handling
7. ✅ Implement health check endpoints
8. ✅ Configure development environment

**Deliverables:**
- Working Express server
- Database connection established
- Auth endpoints (login, register, logout, refresh token)
- Basic middleware stack (auth, validation, error handling)
- API documentation structure

---

### **PHASE 2: Core CRM Features (Week 3-4)**

**Goal**: Implement essential CRM functionality

**Tasks:**
1. ✅ Contacts management API
2. ✅ Projects management API
3. ✅ Tasks management API
4. ✅ Team management API
5. ✅ Calendar/Events API
6. ✅ Basic file upload
7. ✅ Search and filtering
8. ✅ Pagination implementation

**API Endpoints:**
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/refresh
GET    /api/auth/me

GET    /api/contacts
POST   /api/contacts
GET    /api/contacts/:id
PUT    /api/contacts/:id
DELETE /api/contacts/:id

GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id
GET    /api/projects/:id/tasks
GET    /api/projects/:id/team

GET    /api/tasks
POST   /api/tasks
GET    /api/tasks/:id
PUT    /api/tasks/:id
DELETE /api/tasks/:id
PATCH  /api/tasks/:id/status

GET    /api/team/members
POST   /api/team/members
GET    /api/team/members/:id
PUT    /api/team/members/:id
DELETE /api/team/members/:id
POST   /api/team/invitations
```

---

### **PHASE 3: Priority Feature - Accounting System (Week 5-6)** 🔥

**Goal**: Complete accounting, invoicing, and expense management

**Tasks:**
1. ✅ Expenses management (CRUD)
2. ✅ Expense approval workflow
3. ✅ Income/Revenue tracking
4. ✅ Invoice generation
5. ✅ Invoice PDF generation
6. ✅ Financial calculations
7. ✅ Payment status tracking
8. ✅ Financial dashboard data

**API Endpoints:**
```
# Expenses
GET    /api/accounting/expenses
POST   /api/accounting/expenses
GET    /api/accounting/expenses/:id
PUT    /api/accounting/expenses/:id
DELETE /api/accounting/expenses/:id
PATCH  /api/accounting/expenses/:id/approve
PATCH  /api/accounting/expenses/:id/reject
PATCH  /api/accounting/expenses/:id/mark-paid
POST   /api/accounting/expenses/:id/receipt

# Income
GET    /api/accounting/income
POST   /api/accounting/income
GET    /api/accounting/income/:id
PUT    /api/accounting/income/:id
DELETE /api/accounting/income/:id
PATCH  /api/accounting/income/:id/mark-received

# Invoices
GET    /api/accounting/invoices
POST   /api/accounting/invoices
GET    /api/accounting/invoices/:id
PUT    /api/accounting/invoices/:id
DELETE /api/accounting/invoices/:id
POST   /api/accounting/invoices/:id/send
GET    /api/accounting/invoices/:id/pdf
PATCH  /api/accounting/invoices/:id/mark-paid

# Financial Dashboard
GET    /api/accounting/dashboard
GET    /api/accounting/summary
GET    /api/accounting/profit-loss
```

**Key Features:**
- Invoice PDF generation with company branding
- Expense receipt upload and storage
- Approval workflow with notifications
- Financial calculations (totals, taxes, profit/loss)
- Payment tracking and reminders

---

### **PHASE 4: Priority Feature - Proposal System (Week 7-8)** 🔥

**Goal**: Complete proposal generation with PDF export

**Tasks:**
1. ✅ Leads management
2. ✅ Proposals CRUD
3. ✅ Proposal items management
4. ✅ PDF generation from templates
5. ✅ E-signature integration
6. ✅ Proposal versioning
7. ✅ Proposal tracking (viewed, accepted)
8. ✅ Email notifications

**API Endpoints:**
```
# Leads
GET    /api/proposals/leads
POST   /api/proposals/leads
GET    /api/proposals/leads/:id
PUT    /api/proposals/leads/:id
DELETE /api/proposals/leads/:id
POST   /api/proposals/leads/:id/convert

# Proposals
GET    /api/proposals
POST   /api/proposals
GET    /api/proposals/:id
PUT    /api/proposals/:id
DELETE /api/proposals/:id
POST   /api/proposals/:id/send
GET    /api/proposals/:id/pdf
POST   /api/proposals/:id/duplicate
POST   /api/proposals/:id/revise

# Proposal Items
GET    /api/proposals/:id/items
POST   /api/proposals/:id/items
PUT    /api/proposals/:proposalId/items/:itemId
DELETE /api/proposals/:proposalId/items/:itemId

# Client Actions
GET    /api/proposals/public/:token
POST   /api/proposals/public/:token/accept
POST   /api/proposals/public/:token/reject
POST   /api/proposals/public/:token/sign

# Activities
GET    /api/proposals/:id/activities
GET    /api/proposals/:id/revisions
```

**Key Features:**
- Beautiful PDF generation with Handlebars templates
- Customizable proposal templates
- E-signature capture and validation
- Proposal tracking (views, time spent)
- Email notifications for all status changes
- Version control and revision history

---

### **PHASE 5: Priority Feature - Analytics & Reporting (Week 9-10)** 🔥

**Goal**: Advanced analytics and report generation

**Tasks:**
1. ✅ Dashboard metrics calculation
2. ✅ Project analytics
3. ✅ Financial reports
4. ✅ Team performance metrics
5. ✅ Custom report builder
6. ✅ PDF report generation
7. ✅ CSV/Excel exports
8. ✅ Scheduled reports

**API Endpoints:**
```
# Dashboard Analytics
GET    /api/analytics/dashboard
GET    /api/analytics/overview

# Financial Analytics
GET    /api/analytics/revenue
GET    /api/analytics/revenue/trends
GET    /api/analytics/expenses/breakdown
GET    /api/analytics/profit-margins
GET    /api/analytics/project-profitability

# Project Analytics
GET    /api/analytics/projects/overview
GET    /api/analytics/projects/completion-rates
GET    /api/analytics/projects/timeline-adherence
GET    /api/analytics/projects/:id/performance

# Team Analytics
GET    /api/analytics/team/productivity
GET    /api/analytics/team/utilization
GET    /api/analytics/team/:id/performance

# Reports
GET    /api/reports/financial
GET    /api/reports/operational
GET    /api/reports/project/:id
POST   /api/reports/custom
GET    /api/reports/:id/download
GET    /api/reports/templates

# Exports
GET    /api/exports/contacts
GET    /api/exports/projects
GET    /api/exports/expenses
GET    /api/exports/income
GET    /api/exports/tasks
```

**Key Features:**
- Real-time dashboard metrics
- Interactive charts data
- Custom date range filtering
- Scheduled automated reports
- PDF and Excel export
- Email delivery of reports
- Custom report templates

---

### **PHASE 6: Advanced Features (Week 11-12)**

**Goal**: Complete remaining features

**Tasks:**
1. ✅ File upload with processing
2. ✅ Asset management
3. ✅ Email notification system
4. ✅ Calendar integration
5. ✅ Background job processing
6. ✅ Caching strategy
7. ✅ WebSocket for real-time updates (optional)
8. ✅ API documentation (Swagger)

---

### **PHASE 7: Testing & Optimization (Week 13-14)**

**Goal**: Ensure production readiness

**Tasks:**
1. ✅ Unit tests (70%+ coverage)
2. ✅ Integration tests
3. ✅ Load testing
4. ✅ Security audit
5. ✅ Performance optimization
6. ✅ Database query optimization
7. ✅ API documentation completion
8. ✅ Deployment preparation

---

### **PHASE 8: Deployment (Week 15-16)**

**Goal**: Deploy to production

**Tasks:**
1. ✅ VPS setup and hardening
2. ✅ PostgreSQL optimization
3. ✅ Redis setup
4. ✅ Nginx configuration
5. ✅ SSL certificate setup
6. ✅ PM2 process management
7. ✅ Automated backups
8. ✅ Monitoring and alerts
9. ✅ CI/CD pipeline (optional)
10. ✅ Documentation

---

## 📡 API Endpoints Specification

### Authentication Endpoints

```typescript
// POST /api/auth/register
Request: {
  name: string;
  email: string;
  password: string;
  role?: string;
}
Response: {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// POST /api/auth/login
Request: {
  email: string;
  password: string;
}
Response: {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// POST /api/auth/refresh
Request: {
  refreshToken: string;
}
Response: {
  accessToken: string;
  refreshToken: string;
}

// GET /api/auth/me (Protected)
Response: {
  user: User;
}
```

### Accounting Endpoints (Priority)

```typescript
// POST /api/accounting/expenses
Request: {
  project_id: string;
  category: ExpenseCategory;
  amount: number;
  date: Date;
  description: string;
  receipt_url?: string;
  submitted_by: string;
}
Response: {
  expense: Expense;
}

// POST /api/accounting/invoices
Request: {
  project_id: string;
  client_id: string;
  invoice_number: string;
  items: InvoiceItem[];
  due_date: Date;
  notes?: string;
  terms?: string;
}
Response: {
  invoice: Invoice;
}

// GET /api/accounting/invoices/:id/pdf
Response: PDF Buffer
```

### Proposals Endpoints (Priority)

```typescript
// POST /api/proposals
Request: {
  title: string;
  client_id: string;
  lead_id?: string;
  amount: number;
  valid_until: Date;
  items: ProposalItem[];
  terms: string;
}
Response: {
  proposal: Proposal;
}

// GET /api/proposals/:id/pdf
Response: PDF Buffer

// POST /api/proposals/:id/send
Request: {
  recipient_email: string;
  message?: string;
}
Response: {
  success: boolean;
  sent_at: Date;
}
```

### Analytics Endpoints (Priority)

```typescript
// GET /api/analytics/dashboard
Response: {
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  profit_margin: number;
  active_projects: number;
  pending_invoices: number;
  overdue_tasks: number;
  team_utilization: number;
}

// GET /api/analytics/revenue/trends
Query: {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: Date;
  end_date: Date;
}
Response: {
  data: Array<{
    date: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
}
```

---

## 🔒 Security Implementation

### 1. Authentication Strategy

```typescript
// JWT Token Structure
{
  user_id: string;
  email: string;
  role: string;
  permissions: string[];
  iat: number;
  exp: number;
}

// Access Token: 15 minutes
// Refresh Token: 7 days
// Stored in httpOnly cookies (secure)
```

### 2. Password Security

- **Hashing**: bcrypt with 10 rounds
- **Requirements**: Min 8 chars, 1 uppercase, 1 lowercase, 1 number
- **Reset Flow**: Time-limited tokens (1 hour expiry)

### 3. Rate Limiting

```typescript
// Authentication endpoints: 5 requests / 15 minutes
// API endpoints: 100 requests / 15 minutes
// File uploads: 10 requests / hour
```

### 4. Input Validation

- Zod schemas for all request bodies
- Sanitization with express-validator
- File type validation
- Size limits enforcement

### 5. CORS Policy

```typescript
{
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
```

### 6. Role-Based Access Control (RBAC)

```typescript
Roles:
- Owner: Full access
- Manager: Project + team management
- Producer: Project management
- Editor: Limited project access
- Assistant: View only

Permissions:
- can_manage_projects
- can_send_proposals
- can_approve_expenses
- can_manage_team
- can_view_financials
- can_manage_assets
```

---

## 🚢 Deployment Configuration

### VPS Requirements

**Minimum Specs:**
- **CPU**: 2 vCPUs
- **RAM**: 4GB (8GB recommended)
- **Storage**: 50GB SSD
- **OS**: Ubuntu 22.04 LTS
- **Bandwidth**: 100GB/month

**Recommended Providers:**
- DigitalOcean ($24/month)
- Linode ($24/month)
- Vultr ($24/month)
- Hetzner ($15/month - Best value)

### Software Stack Setup

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Install PostgreSQL 15
sudo apt install -y postgresql postgresql-contrib

# 4. Install Redis
sudo apt install -y redis-server

# 5. Install Nginx
sudo apt install -y nginx

# 6. Install PM2 globally
sudo npm install -g pm2

# 7. Install Certbot (SSL)
sudo apt install -y certbot python3-certbot-nginx
```

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/mediaflow-api
server {
    listen 80;
    server_name api.yourdomain.com;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
    limit_req zone=api_limit burst=20;

    # Client max body size (file uploads)
    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files
    location /uploads {
        alias /var/www/mediaflow/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'mediaflow-api',
    script: 'dist/server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    error_file: 'logs/error.log',
    out_file: 'logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '1G',
    autorestart: true,
    watch: false
  }]
};
```

### Environment Variables

```env
# .env.production
NODE_ENV=production
PORT=4000

# Database
DATABASE_URL=postgresql://mediaflow:password@localhost:5432/mediaflow_crm

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_super_secure_secret_key_here
JWT_REFRESH_SECRET=your_refresh_token_secret_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=https://yourdomain.com

# Email (SendGrid)
SENDGRID_API_KEY=your_sendgrid_key
FROM_EMAIL=noreply@yourdomain.com

# File Storage
STORAGE_TYPE=s3  # or 'local'
AWS_REGION=us-east-1
AWS_BUCKET=mediaflow-assets
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Uploads (if local storage)
UPLOAD_DIR=/var/www/mediaflow/uploads
MAX_FILE_SIZE=104857600  # 100MB

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### Database Backups

```bash
# /home/mediaflow/scripts/backup.sh
#!/bin/bash

BACKUP_DIR="/var/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="mediaflow_crm_$DATE.sql.gz"

# Create backup
pg_dump -U mediaflow -d mediaflow_crm | gzip > "$BACKUP_DIR/$FILENAME"

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

# Upload to S3 (optional)
aws s3 cp "$BACKUP_DIR/$FILENAME" s3://your-backup-bucket/database/

# Cron job: 0 2 * * * /home/mediaflow/scripts/backup.sh
```

---

## 📅 Development Roadmap

### Timeline Summary (16 Weeks)

| Week | Phase | Focus Area | Status |
|------|-------|------------|--------|
| 1-2 | Phase 1 | Core Infrastructure | 🔄 |
| 3-4 | Phase 2 | Core CRM Features | ⏳ |
| 5-6 | Phase 3 | 🔥 Accounting System | ⏳ |
| 7-8 | Phase 4 | 🔥 Proposal System | ⏳ |
| 9-10 | Phase 5 | 🔥 Analytics & Reports | ⏳ |
| 11-12 | Phase 6 | Advanced Features | ⏳ |
| 13-14 | Phase 7 | Testing & Optimization | ⏳ |
| 15-16 | Phase 8 | Deployment | ⏳ |

### Milestones

- ✅ **Week 2**: API foundation complete
- ⏳ **Week 4**: Core CRM operational
- ⏳ **Week 6**: Accounting system live
- ⏳ **Week 8**: Proposal system live
- ⏳ **Week 10**: Analytics complete
- ⏳ **Week 12**: All features implemented
- ⏳ **Week 14**: Testing complete
- ⏳ **Week 16**: Production deployment

---

## 🎯 Next Steps

### Immediate Actions (This Week)

1. **Initialize Backend Project**
   ```bash
   cd backend
   npm init -y
   npm install express typescript ts-node @types/node @types/express
   npx tsc --init
   ```

2. **Setup Database**
   - Install PostgreSQL
   - Create database and user
   - Copy migration files

3. **Setup Prisma**
   ```bash
   npm install prisma @prisma/client
   npx prisma init
   ```

4. **Create Initial Files**
   - `src/server.ts`
   - `src/app.ts`
   - `src/config/database.ts`

### Week 1 Goals

- [ ] Project structure created
- [ ] Express server running
- [ ] Database connected
- [ ] Basic auth endpoints working
- [ ] Middleware stack implemented
- [ ] Health check endpoint responding

---

## 📚 Additional Resources

- **Prisma Docs**: https://www.prisma.io/docs
- **Express Best Practices**: https://expressjs.com/en/advanced/best-practice-security.html
- **PostgreSQL Tuning**: https://pgtune.leopard.in.ua/
- **JWT Best Practices**: https://tools.ietf.org/html/rfc8725
- **PM2 Docs**: https://pm2.keymetrics.io/docs/usage/quick-start/

---

## 🤝 Support & Questions

If you have any questions about this implementation plan, need clarification on any phase, or want code examples for specific features, feel free to ask!

**Priority Focus**: Accounting, Proposals, Analytics 🔥

---

*Last Updated: November 26, 2025*
*Version: 1.0*
