# Phase 6: Client Portal Implementation Plan

## 📋 Overview

**Phase**: 6 of 16  
**Timeline**: Weeks 11-12  
**Priority**: HIGH - Customer-facing feature  
**Status**: Planning → Implementation

### What is the Client Portal?

A secure, dedicated interface where clients can:
- View their projects and track progress
- Access and download invoices
- Review and approve proposals
- Upload documents and files
- Communicate with the team
- Receive real-time notifications

### Business Value

- **Client Satisfaction**: Self-service access to information
- **Reduced Support Load**: Clients find answers themselves
- **Professionalism**: Modern, transparent client experience
- **Competitive Edge**: Feature that sets you apart
- **Trust Building**: Transparency builds stronger relationships

---

## 🎯 Features to Implement

### 1. Client Authentication System
- Separate login for clients (different from team login)
- Secure password reset flow
- Email verification
- Session management
- JWT token-based auth

### 2. Client Dashboard
- Welcome message with client name
- Quick stats overview
- Recent projects
- Pending invoices
- Latest proposals
- Recent activity feed

### 3. Project Viewing
- List all assigned projects
- View project details (status, progress, timeline)
- See project milestones
- View associated tasks (read-only)
- Download project documents
- Comment/feedback on projects

### 4. Invoice Access
- View all invoices (paid, pending, overdue)
- Download invoice PDFs
- View payment history
- See invoice details (line items, taxes, totals)
- Payment status tracking

### 5. Proposal Management
- View proposals sent to them
- Read proposal details
- Download proposal PDFs
- Accept or request changes
- Add comments/questions
- Track proposal versions

### 6. Document Management
- Upload documents to projects
- Download shared documents
- Organize files by project
- File versioning
- File type restrictions
- Size limits

### 7. Communication
- Send messages to project team
- Reply to team messages
- Mark messages as read/unread
- File attachments in messages
- Email notifications for new messages

### 8. Notifications
- Real-time in-app notifications
- Email notifications (configurable)
- Notification types:
  - New invoice
  - Payment received
  - Proposal sent
  - Project status change
  - New message
  - Document uploaded

---

## 🗂️ Database Schema Updates

### New Tables Needed

#### 1. `client_users` Table
```prisma
model ClientUser {
  id              String   @id @default(uuid())
  contact_id      String   @unique
  email           String   @unique
  password_hash   String
  is_verified     Boolean  @default(false)
  verification_token String?
  reset_token     String?
  reset_token_expires DateTime?
  last_login      DateTime?
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
  
  contact         Contact  @relation(fields: [contact_id], references: [id], onDelete: Cascade)
  sessions        ClientSession[]
  notifications   ClientNotification[]
  messages        ClientMessage[]
  documents       ClientDocument[]
  activities      ClientActivity[]
}
```

#### 2. `client_sessions` Table
```prisma
model ClientSession {
  id              String   @id @default(uuid())
  client_user_id  String
  token           String   @unique
  ip_address      String?
  user_agent      String?
  expires_at      DateTime
  created_at      DateTime @default(now())
  
  clientUser      ClientUser @relation(fields: [client_user_id], references: [id], onDelete: Cascade)
}
```

#### 3. `client_notifications` Table
```prisma
model ClientNotification {
  id              String   @id @default(uuid())
  client_user_id  String
  type            String   // invoice, proposal, project, message, document
  title           String
  message         String
  link            String?
  is_read         Boolean  @default(false)
  created_at      DateTime @default(now())
  
  clientUser      ClientUser @relation(fields: [client_user_id], references: [id], onDelete: Cascade)
}
```

#### 4. `client_messages` Table
```prisma
model ClientMessage {
  id              String   @id @default(uuid())
  client_user_id  String
  project_id      String?
  sender_type     String   // client or team
  sender_id       String
  message         String   @db.Text
  attachments     Json?
  is_read         Boolean  @default(false)
  created_at      DateTime @default(now())
  
  clientUser      ClientUser @relation(fields: [client_user_id], references: [id], onDelete: Cascade)
  project         Project?   @relation(fields: [project_id], references: [id], onDelete: Cascade)
}
```

#### 5. `client_documents` Table
```prisma
model ClientDocument {
  id              String   @id @default(uuid())
  client_user_id  String
  project_id      String?
  filename        String
  original_name   String
  file_path       String
  file_size       Int
  mime_type       String
  uploaded_by     String   // client or team
  created_at      DateTime @default(now())
  
  clientUser      ClientUser @relation(fields: [client_user_id], references: [id], onDelete: Cascade)
  project         Project?   @relation(fields: [project_id], references: [id], onDelete: Cascade)
}
```

#### 6. `client_activities` Table
```prisma
model ClientActivity {
  id              String   @id @default(uuid())
  client_user_id  String
  action          String   // login, view_invoice, download_proposal, etc.
  entity_type     String?  // project, invoice, proposal
  entity_id       String?
  metadata        Json?
  ip_address      String?
  created_at      DateTime @default(now())
  
  clientUser      ClientUser @relation(fields: [client_user_id], references: [id], onDelete: Cascade)
}
```

#### 7. `proposal_responses` Table
```prisma
model ProposalResponse {
  id              String   @id @default(uuid())
  proposal_id     String
  client_user_id  String
  status          String   // accepted, rejected, changes_requested
  comments        String?  @db.Text
  created_at      DateTime @default(now())
  
  proposal        Proposal @relation(fields: [proposal_id], references: [id], onDelete: Cascade)
}
```

---

## 📁 Files to Create

### Phase 6 Structure
```
backend/src/
├── validators/
│   ├── client-auth.validator.ts      (8 schemas)
│   ├── client-portal.validator.ts    (12 schemas)
│   └── client-messages.validator.ts  (6 schemas)
├── services/
│   ├── client-auth.service.ts        (12 methods)
│   ├── client-portal.service.ts      (15 methods)
│   ├── client-notifications.service.ts (8 methods)
│   └── client-messages.service.ts    (10 methods)
├── controllers/
│   ├── client-auth.controller.ts     (8 controllers)
│   ├── client-portal.controller.ts   (12 controllers)
│   └── client-messages.controller.ts (6 controllers)
├── routes/
│   ├── client-auth.routes.ts         (6 endpoints)
│   ├── client-portal.routes.ts       (15 endpoints)
│   └── client-messages.routes.ts     (6 endpoints)
├── middleware/
│   └── client-auth.middleware.ts     (authenticate clients)
└── utils/
    ├── email-templates.ts            (notification emails)
    └── client-notifications.ts       (notification helpers)
```

**Total Files**: 14 new files  
**Estimated Lines**: ~4,500 lines of code  
**Endpoints**: 27 new API endpoints

---

## 🔌 API Endpoints to Create

### Client Authentication (6 endpoints)
```
POST   /api/client/auth/register          - Client registration
POST   /api/client/auth/login             - Client login
POST   /api/client/auth/logout            - Client logout
POST   /api/client/auth/forgot-password   - Request password reset
POST   /api/client/auth/reset-password    - Reset password
POST   /api/client/auth/verify-email      - Verify email
```

### Client Portal - Dashboard (3 endpoints)
```
GET    /api/client/portal/dashboard       - Get dashboard data
GET    /api/client/portal/profile         - Get client profile
PUT    /api/client/portal/profile         - Update profile
```

### Client Portal - Projects (5 endpoints)
```
GET    /api/client/portal/projects        - List all projects
GET    /api/client/portal/projects/:id    - Get project details
GET    /api/client/portal/projects/:id/tasks - Get project tasks
POST   /api/client/portal/projects/:id/comment - Add project comment
GET    /api/client/portal/projects/:id/documents - Get project documents
```

### Client Portal - Invoices (3 endpoints)
```
GET    /api/client/portal/invoices        - List all invoices
GET    /api/client/portal/invoices/:id    - Get invoice details
GET    /api/client/portal/invoices/:id/download - Download invoice PDF
```

### Client Portal - Proposals (4 endpoints)
```
GET    /api/client/portal/proposals       - List all proposals
GET    /api/client/portal/proposals/:id   - Get proposal details
POST   /api/client/portal/proposals/:id/respond - Accept/reject proposal
GET    /api/client/portal/proposals/:id/download - Download proposal PDF
```

### Client Messages (6 endpoints)
```
GET    /api/client/messages               - List all messages
GET    /api/client/messages/:id           - Get message details
POST   /api/client/messages               - Send new message
PUT    /api/client/messages/:id/read      - Mark as read
DELETE /api/client/messages/:id           - Delete message
POST   /api/client/messages/:id/reply     - Reply to message
```

### Client Notifications (3 endpoints)
```
GET    /api/client/notifications          - List notifications
PUT    /api/client/notifications/:id/read - Mark as read
PUT    /api/client/notifications/read-all - Mark all as read
```

### Client Documents (3 endpoints)
```
GET    /api/client/documents              - List all documents
POST   /api/client/documents/upload       - Upload document
GET    /api/client/documents/:id/download - Download document
```

---

## 🔐 Security Considerations

### 1. Authentication
- Separate JWT tokens for clients
- Different secret key from team auth
- Shorter token expiration (24 hours)
- Refresh token mechanism

### 2. Authorization
- Clients can ONLY see their own data
- Filter by `contact_id` in all queries
- No access to other clients' information
- Read-only access to most data

### 3. Data Isolation
```typescript
// Example: Always filter by client's contact
const projects = await prisma.project.findMany({
  where: {
    client_id: clientUser.contact_id, // Critical!
  }
});
```

### 4. Rate Limiting
- Stricter limits for client endpoints
- Prevent brute force attacks
- API abuse protection

### 5. File Upload Security
- Validate file types
- Scan for malware
- Size limits (10MB per file)
- Secure file storage

---

## 📧 Email Notifications

### Email Templates Needed
1. **Welcome Email** - Account created
2. **Email Verification** - Confirm email
3. **Password Reset** - Reset link
4. **New Invoice** - Invoice issued
5. **Payment Received** - Payment confirmed
6. **Proposal Sent** - New proposal
7. **Project Update** - Status change
8. **New Message** - Team message
9. **Document Uploaded** - New file available

---

## 🎨 Frontend Integration Notes

### Client Portal URL Structure
```
/client/login
/client/register
/client/forgot-password
/client/reset-password
/client/dashboard
/client/projects
/client/projects/:id
/client/invoices
/client/invoices/:id
/client/proposals
/client/proposals/:id
/client/messages
/client/documents
/client/notifications
/client/profile
```

### API Base URL
```
http://localhost:5000/api/client/*
```

### Authentication Headers
```javascript
headers: {
  'Authorization': `Bearer ${clientToken}`,
  'Content-Type': 'application/json'
}
```

---

## ⚡ Performance Optimizations

### 1. Caching Strategy
```typescript
// Cache client dashboard data
CACHE_KEYS.CLIENT_DASHBOARD: (clientId) => `client:${clientId}:dashboard`
CACHE_TTL.CLIENT_DASHBOARD: 60 * 5  // 5 minutes

// Cache client projects
CACHE_KEYS.CLIENT_PROJECTS: (clientId) => `client:${clientId}:projects`
CACHE_TTL.CLIENT_PROJECTS: 60 * 10  // 10 minutes
```

### 2. Pagination
- All lists paginated (10-20 items per page)
- Infinite scroll for mobile

### 3. Lazy Loading
- Load documents on demand
- Lazy load invoice PDFs

---

## 🧪 Testing Strategy

### Unit Tests
- Service layer methods
- Authentication logic
- Authorization checks
- Data filtering

### Integration Tests
- Full API endpoint tests
- Authentication flow
- File upload/download
- Email sending

### Security Tests
- Attempt to access other client data
- Token expiration
- Invalid credentials
- SQL injection attempts

---

## 📊 Success Metrics

### Technical Metrics
- <1sec dashboard load time
- <500ms API response time
- 99.9% uptime
- Zero data leakage incidents

### Business Metrics
- % of clients using portal
- Average session duration
- Feature adoption rate
- Reduced support tickets

---

## 🚀 Implementation Steps

### Step 1: Database Setup (30 minutes)
1. Add Prisma models
2. Create migration
3. Run migration
4. Seed test client users

### Step 2: Authentication (2 hours)
1. Create validators
2. Create auth service
3. Create auth middleware
4. Create auth controller
5. Create auth routes
6. Test authentication flow

### Step 3: Client Portal Core (3 hours)
1. Create portal service
2. Dashboard endpoint
3. Projects endpoints
4. Invoices endpoints
5. Proposals endpoints
6. Test all endpoints

### Step 4: Messaging System (2 hours)
1. Create messages service
2. Create messages controller
3. Create messages routes
4. Test messaging

### Step 5: Notifications (1.5 hours)
1. Create notifications service
2. Create notification helpers
3. Email templates
4. Test notifications

### Step 6: Documents (1.5 hours)
1. File upload handling
2. Document service
3. Document routes
4. Test uploads/downloads

### Step 7: Integration & Testing (2 hours)
1. End-to-end testing
2. Security testing
3. Performance testing
4. Documentation

**Total Estimated Time**: 12-14 hours

---

## 📝 Dependencies

### Required npm Packages
```json
{
  "bcryptjs": "^2.4.3",        // Password hashing (already installed)
  "jsonwebtoken": "^9.0.2",    // JWT tokens (already installed)
  "nodemailer": "^6.9.7",      // Email sending
  "handlebars": "^4.7.8",      // Email templates
  "multer": "^1.4.5-lts.1"     // File uploads (already installed)
}
```

**New packages to install**: `nodemailer`, `handlebars`, `@types/nodemailer`, `@types/handlebars`

---

## 🔄 Integration with Existing System

### Updates to Existing Tables

#### `contacts` Table
- Add `has_portal_access` boolean field
- Link to `client_users` table

#### `projects` Table
- Add `client_visible` boolean field
- Add `client_notes` text field

#### `invoices` Table
- Add `client_viewed_at` datetime field
- Add `client_downloaded_at` datetime field

#### `proposals` Table
- Add `client_viewed_at` datetime field
- Add `client_response_status` enum field

---

## 🎯 Phase 6 Deliverables

### Code
- ✅ 7 Prisma models
- ✅ 14 TypeScript files (~4,500 lines)
- ✅ 27 API endpoints
- ✅ Authentication system
- ✅ File upload system
- ✅ Email notification system

### Documentation
- ✅ API reference
- ✅ Integration guide
- ✅ Security guidelines
- ✅ Testing procedures

### Testing
- ✅ 35+ test cases
- ✅ Security validation
- ✅ Performance benchmarks

---

## 📅 Timeline

**Week 11**:
- Day 1-2: Database schema + migrations
- Day 3-4: Authentication system
- Day 5: Client portal core

**Week 12**:
- Day 1: Messaging system
- Day 2: Notifications + Email
- Day 3: Documents + File uploads
- Day 4: Testing + Documentation
- Day 5: Frontend integration support

---

## ✅ Ready to Start?

This plan provides:
- Clear feature scope
- Database schema
- API endpoint structure
- Security considerations
- Implementation steps
- Timeline estimates

**Next Steps**:
1. Review and approve plan
2. Install new dependencies
3. Create database migrations
4. Start implementation

---

**Status**: 📋 Planning Complete - Ready for Implementation  
**Estimated Completion**: 12-14 hours  
**Priority**: HIGH - Customer-facing feature

Let's build an amazing client portal! 🚀
