# Phase 6 Client Portal API - Complete Documentation

## Overview
The Client Portal provides a secure interface for clients to:
- View their projects, invoices, and proposals
- Communicate with the team via messaging
- Receive notifications
- Access and manage documents
- Track activity history

**Base URL:** `http://localhost:4000/api/client`

---

## Authentication

### Register Client
```bash
POST /api/client/auth/register
Content-Type: application/json

{
  "contactId": "uuid-of-contact",
  "email": "client@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

**Note:** Email must match the contact's email in the database.

### Login
```bash
POST /api/client/auth/login
Content-Type: application/json

{
  "email": "client@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "client@example.com",
      "contact_id": "contact-uuid"
    },
    "access_token": "jwt-token-here",
    "refresh_token": "refresh-token-here"
  }
}
```

### Other Auth Endpoints
- `POST /api/client/auth/logout` - Logout
- `POST /api/client/auth/refresh` - Refresh access token
- `POST /api/client/auth/forgot-password` - Request password reset
- `POST /api/client/auth/reset-password` - Reset password
- `POST /api/client/auth/verify-email` - Verify email
- `POST /api/client/auth/change-password` - Change password

---

## Portal Endpoints

### Dashboard
```bash
GET /api/client/portal/dashboard?period=month
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total_projects": 5,
      "active_projects": 2,
      "total_invoices": 10,
      "pending_invoices": 2,
      "paid_invoices": 8,
      "total_amount": 50000,
      "paid_amount": 40000,
      "pending_proposals": 1
    },
    "recentActivities": [...]
  }
}
```

### Profile Management
```bash
# Get Profile
GET /api/client/portal/profile
Authorization: Bearer YOUR_ACCESS_TOKEN

# Update Profile
PUT /api/client/portal/profile
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "phone": "+1234567890",
  "company": "New Company Name"
}
```

### Projects
```bash
# List Projects
GET /api/client/portal/projects?page=1&limit=10&status=Active
Authorization: Bearer YOUR_ACCESS_TOKEN

# Get Project Details
GET /api/client/portal/projects/:projectId
Authorization: Bearer YOUR_ACCESS_TOKEN

# Add Project Comment
POST /api/client/portal/projects/:projectId/comment
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "comment": "Looking great! Can we adjust the color scheme?"
}
```

### Invoices
```bash
# List Invoices
GET /api/client/portal/invoices?page=1&limit=10&status=Pending
Authorization: Bearer YOUR_ACCESS_TOKEN

# Get Invoice Details
GET /api/client/portal/invoices/:invoiceId
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Proposals
```bash
# List Proposals
GET /api/client/portal/proposals?page=1&limit=10&status=Pending
Authorization: Bearer YOUR_ACCESS_TOKEN

# Get Proposal Details
GET /api/client/portal/proposals/:proposalId
Authorization: Bearer YOUR_ACCESS_TOKEN

# Respond to Proposal
POST /api/client/portal/proposals/:proposalId/respond
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "status": "accepted",  // or "rejected", "changes_requested"
  "comments": "Looks perfect! Let's proceed."
}
```

### Activities
```bash
# Get Activity Feed
GET /api/client/portal/activities?page=1&limit=20
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## Notifications

### Get Notifications
```bash
# All Notifications
GET /api/client/notifications?page=1&limit=20
Authorization: Bearer YOUR_ACCESS_TOKEN

# Unread Only
GET /api/client/notifications?page=1&limit=20&unread_only=true
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Get Unread Count
```bash
GET /api/client/notifications/unread-count
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "unreadCount": 5
  }
}
```

### Mark as Read
```bash
# Mark Single Notification
PUT /api/client/notifications/:notificationId/read
Authorization: Bearer YOUR_ACCESS_TOKEN

# Mark All as Read
PUT /api/client/notifications/mark-all-read
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Delete Notification
```bash
DELETE /api/client/notifications/:notificationId
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## Messaging

### Get Conversations
```bash
GET /api/client/messages?page=1&limit=20
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Get Message Thread
```bash
GET /api/client/messages/thread/:threadId?page=1&limit=50
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Send Message
```bash
POST /api/client/messages
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "recipient_id": "user-uuid",
  "subject": "Question about Project Timeline",
  "message": "When can we expect the first draft?",
  "project_id": "project-uuid",  // optional
  "thread_id": "thread-uuid"     // optional, for replies
}
```

### Mark Message as Read
```bash
PUT /api/client/messages/:messageId/read
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Delete Message
```bash
DELETE /api/client/messages/:messageId
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Get Unread Message Count
```bash
GET /api/client/messages/unread-count
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## Documents

### Get Documents
```bash
# All Documents
GET /api/client/documents?page=1&limit=20
Authorization: Bearer YOUR_ACCESS_TOKEN

# Filter by Type
GET /api/client/documents?type=contract&page=1&limit=20
Authorization: Bearer YOUR_ACCESS_TOKEN

# Filter by Project
GET /api/client/documents?project_id=project-uuid&page=1&limit=20
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Document Types:**
- `contract`
- `invoice`
- `receipt`
- `proposal`
- `deliverable`
- `other`

### Get Document by ID
```bash
GET /api/client/documents/:documentId
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Get Document Types/Categories
```bash
GET /api/client/documents/types
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "types": [
      { "type": "contract", "count": 5 },
      { "type": "invoice", "count": 10 },
      { "type": "deliverable", "count": 8 }
    ]
  }
}
```

### Delete Document
```bash
DELETE /api/client/documents/:documentId
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## Testing with PowerShell

### Save Token
```powershell
# Login and save token
$loginBody = @{
    email = "client@example.com"
    password = "SecurePass123!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:4000/api/client/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $response.data.access_token

# Create headers
$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}
```

### Test Dashboard
```powershell
Invoke-RestMethod -Uri "http://localhost:4000/api/client/portal/dashboard" -Headers $headers
```

### Test Notifications
```powershell
# Get notifications
Invoke-RestMethod -Uri "http://localhost:4000/api/client/notifications" -Headers $headers

# Get unread count
Invoke-RestMethod -Uri "http://localhost:4000/api/client/notifications/unread-count" -Headers $headers

# Mark all as read
Invoke-RestMethod -Uri "http://localhost:4000/api/client/notifications/mark-all-read" -Method PUT -Headers $headers
```

### Test Messaging
```powershell
# Send message
$messageBody = @{
    recipient_id = "recipient-uuid"
    subject = "Test Message"
    message = "Hello from PowerShell!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4000/api/client/messages" -Method POST -Body $messageBody -Headers $headers

# Get conversations
Invoke-RestMethod -Uri "http://localhost:4000/api/client/messages" -Headers $headers

# Get unread count
Invoke-RestMethod -Uri "http://localhost:4000/api/client/messages/unread-count" -Headers $headers
```

### Test Documents
```powershell
# Get all documents
Invoke-RestMethod -Uri "http://localhost:4000/api/client/documents" -Headers $headers

# Get by type
Invoke-RestMethod -Uri "http://localhost:4000/api/client/documents?type=contract" -Headers $headers

# Get document types
Invoke-RestMethod -Uri "http://localhost:4000/api/client/documents/types" -Headers $headers
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...}
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Security Notes

1. **JWT Tokens:** Access tokens expire in 24 hours (configurable)
2. **Data Isolation:** Clients can only access their own data
3. **Session Management:** Sessions are tracked and can be revoked
4. **Password Requirements:** Min 8 chars, uppercase, lowercase, number
5. **Rate Limiting:** Authentication endpoints are rate-limited

---

## Complete Endpoint Summary

**Total Endpoints:** 33

### Authentication (9)
- POST /api/client/auth/register
- POST /api/client/auth/login
- POST /api/client/auth/logout
- POST /api/client/auth/refresh
- POST /api/client/auth/forgot-password
- POST /api/client/auth/reset-password
- POST /api/client/auth/verify-email
- POST /api/client/auth/resend-verification
- POST /api/client/auth/change-password

### Portal (13)
- GET /api/client/portal/dashboard
- GET /api/client/portal/profile
- PUT /api/client/portal/profile
- GET /api/client/portal/projects
- GET /api/client/portal/projects/:id
- POST /api/client/portal/projects/:id/comment
- GET /api/client/portal/invoices
- GET /api/client/portal/invoices/:id
- GET /api/client/portal/proposals
- GET /api/client/portal/proposals/:id
- POST /api/client/portal/proposals/:id/respond
- GET /api/client/portal/activities

### Notifications (5)
- GET /api/client/notifications
- GET /api/client/notifications/unread-count
- PUT /api/client/notifications/:id/read
- PUT /api/client/notifications/mark-all-read
- DELETE /api/client/notifications/:id

### Messaging (6)
- GET /api/client/messages
- GET /api/client/messages/unread-count
- GET /api/client/messages/thread/:threadId
- POST /api/client/messages
- PUT /api/client/messages/:id/read
- DELETE /api/client/messages/:id

### Documents (4)
- GET /api/client/documents
- GET /api/client/documents/types
- GET /api/client/documents/:id
- DELETE /api/client/documents/:id

---

**Phase 6 Complete! 🎉**
