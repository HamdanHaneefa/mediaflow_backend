# MediaFlow CRM Backend - Phase 2 API Testing Guide

This guide provides sample API requests to test all Phase 2 endpoints.

## Prerequisites

1. Backend server running: `npm run dev`
2. Database migrated: `npm run prisma:migrate`
3. Authentication token from login

## Authentication

First, register and login to get your access token:

### Register
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mediaflow.com",
    "password": "SecurePass123",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  }'
```

### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mediaflow.com",
    "password": "SecurePass123"
  }'
```

**Save the `accessToken` from the response and use it in subsequent requests!**

---

## 1. Contacts API

### Create Contact
```bash
curl -X POST http://localhost:4000/api/contacts \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Productions",
    "email": "contact@acme.com",
    "phone": "+1-555-0100",
    "company": "Acme Productions Inc",
    "role": "Client",
    "status": "Active",
    "tags": ["vip", "corporate-video"]
  }'
```

### List Contacts
```bash
# All contacts
curl http://localhost:4000/api/contacts?page=1&limit=10 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Search contacts
curl "http://localhost:4000/api/contacts?search=acme" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Filter by role
curl "http://localhost:4000/api/contacts?role=Client&status=Active" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Contact by ID
```bash
curl http://localhost:4000/api/contacts/{CONTACT_ID} \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Contact Stats
```bash
curl http://localhost:4000/api/contacts/{CONTACT_ID}/stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Update Contact
```bash
curl -X PUT http://localhost:4000/api/contacts/{CONTACT_ID} \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Inactive",
    "notes": "Project completed"
  }'
```

### Delete Contact
```bash
curl -X DELETE http://localhost:4000/api/contacts/{CONTACT_ID} \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 2. Projects API

### Create Project
```bash
curl -X POST http://localhost:4000/api/projects \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Corporate Video Production 2025",
    "description": "Annual company overview video with interviews",
    "type": "Commercial",
    "status": "Active",
    "phase": "Pre-production",
    "client_id": "YOUR_CLIENT_ID_HERE",
    "budget": 75000,
    "start_date": "2025-01-15",
    "end_date": "2025-03-30"
  }'
```

### List Projects
```bash
# All projects
curl http://localhost:4000/api/projects?page=1&limit=10 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Filter by status and phase
curl "http://localhost:4000/api/projects?status=Active&phase=Production" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Search projects
curl "http://localhost:4000/api/projects?search=corporate" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Projects by client
curl "http://localhost:4000/api/projects?client_id=YOUR_CLIENT_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Project by ID
```bash
curl http://localhost:4000/api/projects/{PROJECT_ID} \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Project Stats
```bash
curl http://localhost:4000/api/projects/{PROJECT_ID}/stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Update Project
```bash
curl -X PUT http://localhost:4000/api/projects/{PROJECT_ID} \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phase": "Production",
    "status": "Active"
  }'
```

### Archive Project
```bash
curl -X DELETE http://localhost:4000/api/projects/{PROJECT_ID} \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 3. Tasks API

### Create Task
```bash
curl -X POST http://localhost:4000/api/tasks \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Script Review and Approval",
    "description": "Review final script draft with client feedback",
    "status": "To Do",
    "priority": "High",
    "project_id": "YOUR_PROJECT_ID_HERE",
    "assigned_to": "YOUR_CONTACT_ID_HERE",
    "due_date": "2025-01-20",
    "type": "Creative"
  }'
```

### List Tasks
```bash
# All tasks
curl http://localhost:4000/api/tasks?page=1&limit=10 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Filter by status and priority
curl "http://localhost:4000/api/tasks?status=In Progress&priority=High" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Tasks by project
curl "http://localhost:4000/api/tasks?project_id=YOUR_PROJECT_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Tasks by assignee
curl "http://localhost:4000/api/tasks?assigned_to=YOUR_CONTACT_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Task Stats
```bash
# All task stats
curl http://localhost:4000/api/tasks/stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Task stats by project
curl "http://localhost:4000/api/tasks/stats?project_id=YOUR_PROJECT_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Task by ID
```bash
curl http://localhost:4000/api/tasks/{TASK_ID} \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Update Task
```bash
curl -X PUT http://localhost:4000/api/tasks/{TASK_ID} \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "In Progress",
    "priority": "Urgent"
  }'
```

### Delete Task
```bash
curl -X DELETE http://localhost:4000/api/tasks/{TASK_ID} \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 4. Team Management API

### Create Team Member
```bash
curl -X POST http://localhost:4000/api/team/members \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Sarah",
    "last_name": "Johnson",
    "email": "sarah.johnson@mediaflow.com",
    "phone": "+1-555-0101",
    "role": "member",
    "position": "Senior Video Editor",
    "department": "Post-Production",
    "status": "active",
    "hourly_rate": 85,
    "skills": ["Premiere Pro", "After Effects", "DaVinci Resolve", "Motion Graphics"],
    "bio": "10+ years of video editing experience specializing in corporate and commercial content"
  }'
```

### List Team Members
```bash
# All members
curl http://localhost:4000/api/team/members?page=1&limit=10 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Filter by role and status
curl "http://localhost:4000/api/team/members?role=member&status=active" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Filter by department
curl "http://localhost:4000/api/team/members?department=Post-Production" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Search members
curl "http://localhost:4000/api/team/members?search=sarah" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Team Member by ID
```bash
curl http://localhost:4000/api/team/members/{MEMBER_ID} \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Update Team Member
```bash
curl -X PUT http://localhost:4000/api/team/members/{MEMBER_ID} \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "position": "Lead Video Editor",
    "hourly_rate": 95,
    "skills": ["Premiere Pro", "After Effects", "DaVinci Resolve", "Motion Graphics", "Color Grading"]
  }'
```

### Deactivate Team Member
```bash
curl -X DELETE http://localhost:4000/api/team/members/{MEMBER_ID} \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Assign Member to Project
```bash
curl -X POST http://localhost:4000/api/team/assignments \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "YOUR_PROJECT_ID",
    "team_member_id": "YOUR_MEMBER_ID",
    "role_in_project": "Lead Editor",
    "is_lead": true,
    "responsibilities": ["Edit footage", "Color correction", "Audio mixing"],
    "hourly_rate_override": 100
  }'
```

### Remove Project Assignment
```bash
curl -X DELETE http://localhost:4000/api/team/assignments/{ASSIGNMENT_ID} \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Create Team
```bash
curl -X POST http://localhost:4000/api/team \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Post-Production Team",
    "description": "Handles all video editing, color grading, and final delivery",
    "manager_id": "YOUR_MANAGER_ID",
    "member_ids": ["MEMBER_ID_1", "MEMBER_ID_2"]
  }'
```

### List Teams
```bash
curl http://localhost:4000/api/team?page=1&limit=10 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Team by ID
```bash
curl http://localhost:4000/api/team/{TEAM_ID} \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Update Team
```bash
curl -X PUT http://localhost:4000/api/team/{TEAM_ID} \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Post-Production & VFX Team",
    "description": "Expanded to include VFX capabilities"
  }'
```

### Delete Team
```bash
curl -X DELETE http://localhost:4000/api/team/{TEAM_ID} \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 5. File Upload API

### Upload Image
```bash
curl -X POST http://localhost:4000/api/upload/image \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/your/image.jpg"
```

### Upload Multiple Images
```bash
curl -X POST http://localhost:4000/api/upload/images \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "files=@/path/to/image1.jpg" \
  -F "files=@/path/to/image2.jpg" \
  -F "files=@/path/to/image3.jpg"
```

### Upload Document
```bash
curl -X POST http://localhost:4000/api/upload/document \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/document.pdf"
```

### Upload Multiple Documents
```bash
curl -X POST http://localhost:4000/api/upload/documents \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "files=@/path/to/contract.pdf" \
  -F "files=@/path/to/invoice.pdf"
```

### Upload Video
```bash
curl -X POST http://localhost:4000/api/upload/video \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/video.mp4"
```

### Upload Avatar
```bash
curl -X POST http://localhost:4000/api/upload/avatar \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/avatar.jpg"
```

### Upload Receipt
```bash
curl -X POST http://localhost:4000/api/upload/receipt \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/receipt.jpg"
```

---

## Testing with Postman

### Setup
1. Import the API endpoints into Postman
2. Create an environment with `baseUrl` = `http://localhost:4000`
3. Add `accessToken` variable after login

### Environment Variables
```json
{
  "baseUrl": "http://localhost:4000",
  "accessToken": "your-token-here",
  "contactId": "",
  "projectId": "",
  "taskId": "",
  "memberId": "",
  "teamId": ""
}
```

### Authorization Header
Add to all requests:
```
Authorization: Bearer {{accessToken}}
```

---

## Response Format

All successful responses follow this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  },
  "timestamp": "2025-11-26T10:30:00.000Z"
}
```

Paginated responses include:

```json
{
  "success": true,
  "message": "Resources retrieved successfully",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5,
    "hasMore": true
  },
  "timestamp": "2025-11-26T10:30:00.000Z"
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error message",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error details"
  },
  "timestamp": "2025-11-26T10:30:00.000Z"
}
```

---

## Tips

1. **Save IDs**: After creating resources, save their IDs for subsequent requests
2. **Use Variables**: Replace `{RESOURCE_ID}` with actual UUIDs
3. **Check Logs**: View server logs with `npm run logs`
4. **Validate Input**: All endpoints use Zod validation
5. **Relationships**: Create contacts before projects, projects before tasks
6. **File Sizes**: Respect file size limits for uploads

---

## Common Issues

### 401 Unauthorized
- Your token expired (15 minutes)
- Use refresh token endpoint or login again

### 404 Not Found
- Check the resource ID is correct and exists
- Verify you're using the correct UUID format

### 409 Conflict
- Email already exists (contacts, team members)
- Resource has dependencies (can't delete)

### 400 Bad Request
- Check your JSON payload
- Validate required fields
- Check data types match schemas

---

## Next Steps

After testing Phase 2:
1. Move to Phase 3-4: Accounting System
2. Implement expense and income tracking
3. Build invoice generation
4. Create financial reports

---

**Happy Testing!** 🚀
