# Client Portal API - Quick Reference

## 🔐 Authentication Flow

### 1. Register Client
```http
POST /api/client/auth/register
Content-Type: application/json

{
  "contactId": "uuid-of-existing-contact",
  "email": "client@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "data": {
    "id": "client-user-uuid",
    "email": "client@example.com",
    "isVerified": false,
    "verificationToken": "token-here"
  }
}
```

### 2. Login
```http
POST /api/client/auth/login
Content-Type: application/json

{
  "email": "client@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h",
    "user": {
      "id": "client-user-uuid",
      "email": "client@example.com",
      "name": "John Doe",
      "company": "Acme Corp",
      "isVerified": true
    }
  }
}
```

### 3. Use Token in Requests
```http
GET /api/client/portal/dashboard
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📊 Dashboard

### Get Dashboard Metrics
```http
GET /api/client/portal/dashboard?period=month
Authorization: Bearer TOKEN
```

**Query Params:**
- `period`: `week` | `month` | `quarter` | `year` | `all` (default: month)

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "activeProjects": 3,
      "totalProjects": 10,
      "pendingInvoices": 2,
      "paidInvoices": 8,
      "totalInvoicesAmount": 50000,
      "paidAmount": 40000,
      "outstandingAmount": 10000,
      "activeProposals": 1
    },
    "recentActivities": [...],
    "period": "month"
  }
}
```

---

## 👤 Profile

### Get Profile
```http
GET /api/client/portal/profile
Authorization: Bearer TOKEN
```

### Update Profile
```http
PUT /api/client/portal/profile
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "+1234567890",
  "company": "Acme Corp"
}
```

---

## 📁 Projects

### List Projects
```http
GET /api/client/portal/projects?page=1&limit=10&status=Active
Authorization: Bearer TOKEN
```

**Query Params:**
- `status`: Filter by status (optional)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sortBy`: Field to sort by (default: created_at)
- `sortOrder`: `asc` | `desc` (default: desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "projects": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

### Get Single Project
```http
GET /api/client/portal/projects/{projectId}
Authorization: Bearer TOKEN
```

### Add Project Comment
```http
POST /api/client/portal/projects/{projectId}/comment
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "comment": "This is a comment on the project"
}
```

---

## 💰 Invoices

### List Invoices
```http
GET /api/client/portal/invoices?page=1&limit=10&status=Pending
Authorization: Bearer TOKEN
```

**Query Params:**
- `status`: Filter by status (optional)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sortBy`: Field to sort by (default: expected_date)
- `sortOrder`: `asc` | `desc` (default: desc)

### Get Single Invoice
```http
GET /api/client/portal/invoices/{invoiceId}
Authorization: Bearer TOKEN
```

---

## 📄 Proposals

### List Proposals
```http
GET /api/client/portal/proposals?page=1&limit=10
Authorization: Bearer TOKEN
```

**Query Params:**
- `status`: Filter by status (optional)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sortBy`: Field to sort by (default: created_at)
- `sortOrder`: `asc` | `desc` (default: desc)

### Get Single Proposal
```http
GET /api/client/portal/proposals/{proposalId}
Authorization: Bearer TOKEN
```

### Respond to Proposal
```http
POST /api/client/portal/proposals/{proposalId}/respond
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "status": "accepted",
  "comments": "Looks great! Let's proceed."
}
```

**Status Options:**
- `accepted` - Accept the proposal
- `rejected` - Reject the proposal
- `changes_requested` - Request changes

---

## 🔑 Password Management

### Forgot Password
```http
POST /api/client/auth/forgot-password
Content-Type: application/json

{
  "email": "client@example.com"
}
```

### Reset Password
```http
POST /api/client/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "password": "NewSecurePass123",
  "confirmPassword": "NewSecurePass123"
}
```

### Change Password (Authenticated)
```http
POST /api/client/auth/change-password
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "currentPassword": "OldPass123",
  "newPassword": "NewSecurePass123",
  "confirmPassword": "NewSecurePass123"
}
```

---

## ✉️ Email Verification

### Verify Email
```http
POST /api/client/auth/verify-email
Content-Type: application/json

{
  "token": "verification-token-from-email"
}
```

### Resend Verification
```http
POST /api/client/auth/resend-verification
Content-Type: application/json

{
  "email": "client@example.com"
}
```

---

## 🚪 Logout

```http
POST /api/client/auth/logout
Authorization: Bearer TOKEN
```

---

## 📱 Get Current User

```http
GET /api/client/auth/me
Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "client-user-uuid",
    "email": "client@example.com",
    "name": "John Doe",
    "company": "Acme Corp",
    "phone": "+1234567890",
    "contactId": "contact-uuid"
  }
}
```

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 🔒 Security Notes

1. **JWT Token**: Store securely (httpOnly cookie or secure storage)
2. **Token Expiration**: 24 hours (configurable)
3. **Password Requirements**:
   - Minimum 8 characters
   - At least 1 uppercase letter
   - At least 1 lowercase letter
   - At least 1 number

4. **Rate Limiting**: Applied to auth endpoints
5. **Session Management**: Tokens tied to sessions in database
6. **Data Isolation**: Clients can only access their own data

---

## 🧪 Testing with cURL

### Complete Flow Example
```bash
# 1. Register
curl -X POST http://localhost:5000/api/client/auth/register \
  -H "Content-Type: application/json" \
  -d '{"contactId":"uuid","email":"client@test.com","password":"Test123","confirmPassword":"Test123"}'

# 2. Login (save token)
TOKEN=$(curl -X POST http://localhost:5000/api/client/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"client@test.com","password":"Test123"}' \
  | jq -r '.data.token')

# 3. Get Dashboard
curl -X GET http://localhost:5000/api/client/portal/dashboard \
  -H "Authorization: Bearer $TOKEN"

# 4. List Projects
curl -X GET "http://localhost:5000/api/client/portal/projects?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"

# 5. Get Project Details
curl -X GET http://localhost:5000/api/client/portal/projects/{project-id} \
  -H "Authorization: Bearer $TOKEN"

# 6. Add Comment
curl -X POST http://localhost:5000/api/client/portal/projects/{project-id}/comment \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"comment":"Great progress!"}'

# 7. List Invoices
curl -X GET http://localhost:5000/api/client/portal/invoices \
  -H "Authorization: Bearer $TOKEN"

# 8. List Proposals
curl -X GET http://localhost:5000/api/client/portal/proposals \
  -H "Authorization: Bearer $TOKEN"

# 9. Respond to Proposal
curl -X POST http://localhost:5000/api/client/portal/proposals/{proposal-id}/respond \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"accepted","comments":"Looks good!"}'

# 10. Logout
curl -X POST http://localhost:5000/api/client/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📚 Base URL

**Development**: `http://localhost:5000`  
**Production**: `https://your-domain.com`

**All Client Portal Routes**: `/api/client/*`

---

## 🎯 Quick Tips

1. **Always include Authorization header** for protected routes
2. **Check token expiration** (24h default)
3. **Handle 401 errors** by redirecting to login
4. **Validate inputs** before sending requests
5. **Store tokens securely** (never in localStorage for production)
6. **Use HTTPS** in production
7. **Implement token refresh** for better UX

---

**Last Updated**: November 26, 2025  
**API Version**: 1.0  
**Status**: ✅ Operational (Core Features)
