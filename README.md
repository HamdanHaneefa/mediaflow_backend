# MediaFlow CRM - Backend API

> Production-ready Node.js/Express backend for media production companies

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)

---

## 🎯 Overview

MediaFlow CRM Backend is a comprehensive API server built for managing media production workflows, including:

- **Accounting & Invoicing** - Complete financial management
- **Proposal Generation** - Professional PDF proposals with e-signatures
- **Advanced Analytics** - Real-time business intelligence and reporting
- **Project Management** - End-to-end production tracking
- **Team Collaboration** - Role-based access control
- **Asset Management** - Media file organization and sharing

---

## 🚀 Quick Start

### Prerequisites

- Node.js v20+
- PostgreSQL v15+
- Redis (optional for development)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
copy .env.example .env

# Setup database
npm run prisma:migrate

# Seed database with sample data
npm run prisma:seed

# Start development server
npm run dev
```

Server will be running at `http://localhost:4000`

📚 **For detailed setup instructions, see [QUICKSTART.md](./QUICKSTART.md)**

---

## 📋 Documentation

- **[Implementation Plan](./BACKEND_IMPLEMENTATION_PLAN.md)** - Complete development roadmap
- **[Quick Start Guide](./QUICKSTART.md)** - Get up and running in 15 minutes
- **[Interactive API Docs](http://localhost:4000/api/docs)** - Swagger UI with OpenAPI 3.0.3 specification (when server is running)
- **[OpenAPI Spec JSON](http://localhost:4000/api/docs/openapi.json)** - Download for Postman, Insomnia, etc.
- **[All Endpoints List](./ALL_ENDPOINTS.md)** - Complete markdown reference of all API endpoints
- **[API Testing Guide](./API_TESTING_GUIDE.md)** - Curl examples for testing
- **[Phase 2 Complete](./PHASE_2_COMPLETE.md)** - Core CRM features (Contacts, Projects, Tasks, Team)
- **[Phase 3 Complete](./PHASE_3_COMPLETE.md)** - Accounting & Invoicing System
- **[Accounting Quick Start](./ACCOUNTING_QUICKSTART.md)** - Test accounting features
- **[Phase 4 Complete](./PHASE_4_COMPLETE.md)** - Proposal System 🔥 **NEW**
- **[Proposals Quick Start](./PROPOSALS_QUICKSTART.md)** - Test proposal features 🔥 **NEW**
- **[OpenAPI Docs Guide](./OPENAPI_DOCS_COMPLETE.md)** - How to use the interactive documentation

---

## 🛠 Technology Stack

| Category | Technology |
|----------|-----------|
| **Runtime** | Node.js v20+ |
| **Framework** | Express.js |
| **Language** | TypeScript |
| **Database** | PostgreSQL + Prisma ORM |
| **Caching** | Redis |
| **Authentication** | JWT + bcrypt |
| **File Processing** | Sharp, Puppeteer |
| **Email** | Nodemailer |
| **Background Jobs** | Bull Queue |
| **API Docs** | Swagger/OpenAPI |
| **Testing** | Jest + Supertest |

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   ├── validators/      # Input validation
│   ├── utils/           # Helper functions
│   └── prisma/          # Database schema
├── tests/               # Test files
├── uploads/             # File storage
├── logs/                # Application logs
└── docs/                # Documentation
```

---

## 🔑 Key Features

### 🔥 Priority Features (MVP)

#### 1. Accounting & Invoicing ✅
- Complete expense management
- Income tracking
- Invoice generation with PDF export
- Approval workflows
- Financial reporting
- Payment tracking

#### 2. Proposal System ✅
- Professional proposal creation
- Beautiful PDF generation
- E-signature capture
- Email delivery
- Client self-service
- Lead tracking & conversion
- View analytics

#### 3. Analytics & Reporting
- Real-time dashboard metrics
- Financial analytics
- Team performance tracking
- Custom report builder
- CSV/PDF exports

### 📊 Core CRM Features

- **Contacts Management** - Clients, vendors, freelancers
- **Project Management** - End-to-end production tracking
- **Task Management** - Assignment and progress tracking
- **Team Management** - Role-based permissions
- **Calendar/Scheduling** - Event and shoot scheduling
- **File Upload** - Asset management with processing

---

## 🔒 Security

- **JWT Authentication** with refresh tokens
- **bcrypt** password hashing (10 rounds)
- **Rate limiting** on all endpoints
- **Helmet.js** security headers
- **Input validation** with Zod schemas
- **CORS** protection
- **SQL injection** prevention (Prisma ORM)
- **XSS** protection

---

## 📡 API Endpoints

### Authentication ✅
```
POST   /api/auth/register        - User registration
POST   /api/auth/login           - User login
POST   /api/auth/logout          - User logout
POST   /api/auth/refresh         - Refresh access token
GET    /api/auth/me              - Get current user
POST   /api/auth/forgot-password - Request password reset
POST   /api/auth/reset-password  - Reset password
PATCH  /api/auth/change-password - Change password
```

### Contacts ✅ (Phase 2)
```
POST   /api/contacts             - Create contact
GET    /api/contacts             - List contacts (paginated)
GET    /api/contacts/:id         - Get contact details
GET    /api/contacts/:id/stats   - Get contact statistics
PUT    /api/contacts/:id         - Update contact
DELETE /api/contacts/:id         - Delete contact
```

### Projects ✅ (Phase 2)
```
POST   /api/projects             - Create project
GET    /api/projects             - List projects (paginated)
GET    /api/projects/:id         - Get project details
GET    /api/projects/:id/stats   - Get project statistics
PUT    /api/projects/:id         - Update project
DELETE /api/projects/:id         - Archive project
```

### Tasks ✅ (Phase 2)
```
POST   /api/tasks                - Create task
GET    /api/tasks                - List tasks (paginated)
GET    /api/tasks/stats          - Get task statistics
GET    /api/tasks/:id            - Get task details
PUT    /api/tasks/:id            - Update task
DELETE /api/tasks/:id            - Delete task
```

### Team Management ✅ (Phase 2)
```
POST   /api/team/members         - Create team member
GET    /api/team/members         - List team members
GET    /api/team/members/:id     - Get member details
PUT    /api/team/members/:id     - Update member
DELETE /api/team/members/:id     - Deactivate member

POST   /api/team/assignments     - Assign member to project
DELETE /api/team/assignments/:id - Remove assignment

POST   /api/team                 - Create team
GET    /api/team                 - List teams
GET    /api/team/:id             - Get team details
PUT    /api/team/:id             - Update team
DELETE /api/team/:id             - Delete team
```

### File Upload ✅ (Phase 2)
```
POST   /api/upload/image         - Upload single image
POST   /api/upload/images        - Upload multiple images
POST   /api/upload/document      - Upload document
POST   /api/upload/documents     - Upload multiple documents
POST   /api/upload/video         - Upload video
POST   /api/upload/avatar        - Upload avatar
POST   /api/upload/receipt       - Upload receipt
POST   /api/upload/any           - Upload any file
```

### Accounting ✅ (Phase 3)
```
# Expenses
POST   /api/accounting/expenses              - Create expense
GET    /api/accounting/expenses              - List expenses
GET    /api/accounting/expenses/:id          - Get expense
PUT    /api/accounting/expenses/:id          - Update expense
DELETE /api/accounting/expenses/:id          - Delete expense
PATCH  /api/accounting/expenses/:id/approve  - Approve expense
PATCH  /api/accounting/expenses/:id/reject   - Reject expense

# Income
POST   /api/accounting/income                - Create income
GET    /api/accounting/income                - List income
GET    /api/accounting/income/:id            - Get income
PUT    /api/accounting/income/:id            - Update income
DELETE /api/accounting/income/:id            - Delete income

# Invoices
POST   /api/accounting/invoices              - Create invoice
GET    /api/accounting/invoices              - List invoices
GET    /api/accounting/invoices/:id          - Get invoice
PUT    /api/accounting/invoices/:id          - Update invoice
DELETE /api/accounting/invoices/:id          - Delete invoice
POST   /api/accounting/invoices/:id/send     - Send invoice
GET    /api/accounting/invoices/:id/pdf      - Generate PDF

# Reports
GET    /api/accounting/reports/cash-flow     - Cash flow report
GET    /api/accounting/reports/profit-loss   - P&L statement
GET    /api/accounting/reports/expenses      - Expense report
```

### Proposals ✅ (Phase 4) 🔥
```
# Leads
POST   /api/proposals/leads                  - Create lead
GET    /api/proposals/leads                  - List leads
GET    /api/proposals/leads/stats            - Lead statistics
GET    /api/proposals/leads/:id              - Get lead
PUT    /api/proposals/leads/:id              - Update lead
DELETE /api/proposals/leads/:id              - Delete lead
POST   /api/proposals/leads/:id/convert      - Convert to client

# Proposals
POST   /api/proposals                        - Create proposal
GET    /api/proposals                        - List proposals
GET    /api/proposals/stats                  - Proposal statistics
GET    /api/proposals/:id                    - Get proposal
PUT    /api/proposals/:id                    - Update proposal
PATCH  /api/proposals/:id/status             - Update status
DELETE /api/proposals/:id                    - Delete proposal
POST   /api/proposals/:id/pdf                - Generate PDF
POST   /api/proposals/:id/send               - Send via email

# Public (No Auth)
GET    /api/proposals/public/:token          - View proposal
POST   /api/proposals/public/:token/sign     - Sign proposal
POST   /api/proposals/public/:token/track    - Track view
```

### Analytics (Coming in Phase 7-8) ⏳
```
GET    /api/analytics/dashboard      - Dashboard metrics
GET    /api/analytics/revenue/trends - Revenue trends
GET    /api/reports/financial        - Financial report
GET    /api/reports/custom           - Custom reports
```

**📚 Full API testing guide**: [API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md)

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

---

## 🚢 Deployment

### Self-Hosted VPS (Recommended)

**Requirements:**
- 2 vCPUs, 4GB RAM, 50GB SSD
- Ubuntu 22.04 LTS
- PostgreSQL 15+
- Redis
- Nginx
- PM2

**Quick Deploy:**

```bash
# 1. Clone repository
git clone https://github.com/yourusername/mediaflow-crm.git
cd mediaflow-crm/backend

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
nano .env

# 4. Build application
npm run build

# 5. Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

📚 **Detailed deployment guide**: [BACKEND_IMPLEMENTATION_PLAN.md#deployment-configuration](./BACKEND_IMPLEMENTATION_PLAN.md#deployment-configuration)

---

## 🔧 Development

### Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server
npm test                 # Run tests
npm run lint             # Lint code
npm run format           # Format code
npm run prisma:studio    # Open database GUI
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/mediaflow_crm
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:3000
```

---

## 📈 Development Roadmap

| Phase | Timeline | Status |
|-------|----------|--------|
| Core Infrastructure | Week 1-2 | ✅ Complete |
| Core CRM Features | Week 3-4 | ✅ Complete |
| Accounting System | Week 5-6 | ⏳ Next |
| Proposal System | Week 7-8 | ⏳ Pending |
| Analytics & Reports | Week 9-10 | ⏳ Pending |
| Advanced Features | Week 11-12 | ⏳ Pending |
| Testing & QA | Week 13-14 | ⏳ Pending |
| Production Deploy | Week 15-16 | ⏳ Pending |

### ✅ Completed Phases

**Phase 1: Core Infrastructure** ✅
- Express server with TypeScript
- JWT authentication system
- Prisma ORM integration
- Error handling & logging
- Security middleware

**Phase 2: Core CRM Features** ✅
- **40+ API endpoints** fully functional
- Contacts management (CRUD + stats)
- Projects management (CRUD + stats)
- Tasks management (CRUD + stats)
- Team management (members, teams, assignments)
- File upload system (images, docs, videos)
- Full pagination & filtering
- Comprehensive validation

📚 **See [PHASE_2_COMPLETE.md](./PHASE_2_COMPLETE.md) for detailed documentation**

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

- **Documentation**: [QUICKSTART.md](./QUICKSTART.md), [BACKEND_IMPLEMENTATION_PLAN.md](./BACKEND_IMPLEMENTATION_PLAN.md)
- **API Reference**: `http://localhost:4000/api/docs`
- **Issues**: [GitHub Issues](https://github.com/yourusername/mediaflow-crm/issues)

---

## 👥 Team

Built with ❤️ by the MediaFlow Team

---

**Status**: ✅ Phase 2 Complete - 40+ Endpoints Live!

**Current Version**: 1.0.0

**Last Updated**: November 26, 2025

---

## 🎉 Latest Updates

### Phase 2 Complete! (November 26, 2025)
- ✅ **40+ API endpoints** implemented
- ✅ Complete CRUD for Contacts, Projects, Tasks, Team
- ✅ File upload system with type validation
- ✅ Pagination and filtering on all list endpoints
- ✅ Statistics and analytics endpoints
- ✅ Comprehensive documentation

**Next:** Phase 3-4 - Accounting System (Weeks 5-6)
