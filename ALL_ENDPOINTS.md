# 📚 MediaFlow CRM API - Complete Endpoints List

## Base URL
```
http://localhost:4000/api
```

## 📖 Documentation
- **Interactive Docs**: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

---

## 🔐 Authentication Endpoints (8)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | Login with credentials | ❌ |
| POST | `/auth/refresh` | Refresh access token | ❌ |
| GET | `/auth/me` | Get current user | ✅ |
| POST | `/auth/logout` | Logout user | ✅ |
| POST | `/auth/forgot-password` | Request password reset | ❌ |
| POST | `/auth/reset-password` | Reset password with token | ❌ |
| PATCH | `/auth/change-password` | Change current password | ✅ |

---

## 📇 Contacts Endpoints (6)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/contacts` | Create new contact | ✅ |
| GET | `/contacts` | List all contacts (paginated) | ✅ |
| GET | `/contacts/:id` | Get contact by ID | ✅ |
| GET | `/contacts/:id/stats` | Get contact statistics | ✅ |
| PUT | `/contacts/:id` | Update contact | ✅ |
| DELETE | `/contacts/:id` | Delete contact | ✅ |

### Contacts Query Parameters
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 10)
- `search` (string) - Search by name/email/company
- `role` (enum) - Filter by role: Client | Vendor | Freelancer | Partner
- `status` (enum) - Filter by status: Active | Inactive | Pending
- `sortBy` (string) - Sort field (default: created_at)
- `sortOrder` (enum) - asc | desc (default: desc)

---

## 🎬 Projects Endpoints (6)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/projects` | Create new project | ✅ |
| GET | `/projects` | List all projects (paginated) | ✅ |
| GET | `/projects/:id` | Get project by ID | ✅ |
| GET | `/projects/:id/stats` | Get project statistics | ✅ |
| PUT | `/projects/:id` | Update project | ✅ |
| DELETE | `/projects/:id` | Archive project | ✅ |

### Projects Query Parameters
- `page` (number) - Page number
- `limit` (number) - Items per page
- `search` (string) - Search by title/description
- `status` (enum) - Filter by status: Active | On Hold | Completed | Cancelled
- `phase` (enum) - Filter by phase: Pre-production | Production | Post-production | Delivery
- `client_id` (uuid) - Filter by client
- `sortBy` (string) - Sort field
- `sortOrder` (enum) - asc | desc

---

## ✅ Tasks Endpoints (7)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/tasks` | Create new task | ✅ |
| GET | `/tasks` | List all tasks (paginated) | ✅ |
| GET | `/tasks/stats` | Get task statistics | ✅ |
| GET | `/tasks/:id` | Get task by ID | ✅ |
| PUT | `/tasks/:id` | Update task | ✅ |
| DELETE | `/tasks/:id` | Delete task | ✅ |

### Tasks Query Parameters
- `page` (number) - Page number
- `limit` (number) - Items per page
- `search` (string) - Search by title/description
- `status` (enum) - Filter by status: To Do | In Progress | Review | Done | Blocked
- `priority` (enum) - Filter by priority: Low | Medium | High | Urgent
- `project_id` (uuid) - Filter by project
- `assigned_to` (uuid) - Filter by assignee
- `sortBy` (string) - Sort field
- `sortOrder` (enum) - asc | desc

---

## 👥 Team Management Endpoints (13)

### Team Members (5)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/team/members` | Create new team member | ✅ |
| GET | `/team/members` | List all team members | ✅ |
| GET | `/team/members/:id` | Get team member by ID | ✅ |
| PUT | `/team/members/:id` | Update team member | ✅ |
| DELETE | `/team/members/:id` | Deactivate team member | ✅ |

### Project Assignments (2)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/team/assignments` | Assign member to project | ✅ |
| DELETE | `/team/assignments/:id` | Remove project assignment | ✅ |

### Teams (6)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/team` | Create new team | ✅ |
| GET | `/team` | List all teams | ✅ |
| GET | `/team/:id` | Get team by ID | ✅ |
| PUT | `/team/:id` | Update team | ✅ |
| DELETE | `/team/:id` | Delete team | ✅ |

### Team Members Query Parameters
- `page` (number) - Page number
- `limit` (number) - Items per page
- `search` (string) - Search by name/email/position
- `role` (enum) - Filter by role: admin | manager | member | viewer
- `status` (enum) - Filter by status: active | inactive | on_leave
- `department` (string) - Filter by department
- `team_id` (uuid) - Filter by team

---

## 📁 File Upload Endpoints (8)

| Method | Endpoint | Description | Size Limit | Formats |
|--------|----------|-------------|------------|---------|
| POST | `/upload/image` | Upload single image | 10MB | jpg, png, gif, webp |
| POST | `/upload/images` | Upload multiple images (max 10) | 10MB each | jpg, png, gif, webp |
| POST | `/upload/document` | Upload single document | 50MB | pdf, doc, docx, xls, xlsx, ppt, txt, csv |
| POST | `/upload/documents` | Upload multiple documents (max 10) | 50MB each | pdf, doc, docx, xls, xlsx, ppt, txt, csv |
| POST | `/upload/video` | Upload video file | 500MB | mp4, avi, mov, wmv, mkv, webm |
| POST | `/upload/avatar` | Upload avatar image | 5MB | jpg, png, gif |
| POST | `/upload/receipt` | Upload receipt image | 10MB | jpg, png, pdf |
| POST | `/upload/any` | Upload any file type | 100MB | All types |

### Upload Request Format
All upload endpoints use `multipart/form-data`:
- Single file: field name `file`
- Multiple files: field name `files`

### Upload Response Format
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "filename": "1234567890-abc.jpg",
    "originalname": "photo.jpg",
    "mimetype": "image/jpeg",
    "size": 1048576,
    "url": "/uploads/images/1234567890-abc.jpg",
    "path": "uploads/images/1234567890-abc.jpg"
  }
}
```

---

## 🏥 Health Check Endpoints (2)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Basic health check | ❌ |
| GET | `/health/detailed` | Detailed system info | ❌ |

---

## 📊 Total Endpoints Summary

| Category | Endpoint Count | Authentication Required |
|----------|----------------|------------------------|
| Authentication | 8 | Partial (5 require auth) |
| Contacts | 6 | ✅ All |
| Projects | 6 | ✅ All |
| Tasks | 7 | ✅ All |
| Team Management | 13 | ✅ All |
| File Upload | 8 | ✅ All |
| Health Check | 2 | ❌ None |
| **TOTAL** | **50** | **40 require auth** |

---

## 🔑 Authentication Header Format

All protected endpoints require the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Example:
```bash
curl -X GET http://localhost:4000/api/contacts \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 📝 Common Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ },
  "timestamp": "2025-11-26T10:30:00.000Z"
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Items retrieved successfully",
  "data": [ /* items array */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "timestamp": "2025-11-26T10:30:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [ /* validation errors if any */ ],
  "timestamp": "2025-11-26T10:30:00.000Z"
}
```

---

## 🚀 Quick Start

1. **Start the server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Register a user:**
   ```bash
   curl -X POST http://localhost:4000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@example.com",
       "password": "Admin123456",
       "firstName": "Admin",
       "lastName": "User"
     }'
   ```

3. **Save the access token from the response**

4. **Test protected endpoint:**
   ```bash
   curl -X GET http://localhost:4000/api/contacts \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

5. **View interactive documentation:**
   Open [http://localhost:4000/api/docs](http://localhost:4000/api/docs) in your browser

---

## 📚 Additional Resources

- **API Testing Guide**: `backend/API_TESTING_GUIDE.md`
- **Phase 2 Complete Documentation**: `backend/PHASE_2_COMPLETE.md`
- **Implementation Status**: `backend/IMPLEMENTATION_STATUS.md`
- **Quick Reference**: `backend/QUICK_REFERENCE.md`

---

## 💡 Pro Tips

1. **Rate Limiting**: Auth endpoints have rate limiting (100 requests per 15 minutes)
2. **Pagination**: Default is 10 items per page, max is 100
3. **Search**: Most list endpoints support full-text search
4. **Soft Delete**: Contacts, Projects, and Team Members use soft delete
5. **UUIDs**: All IDs are UUIDs, not integers
6. **File Organization**: Uploads are organized by type in separate folders
7. **Statistics**: Available for Contacts, Projects, and Tasks
8. **Timestamps**: All records have `created_at` and `updated_at`

---

**Last Updated**: November 26, 2025  
**API Version**: 1.0.0  
**Status**: ✅ Phase 2 Complete
