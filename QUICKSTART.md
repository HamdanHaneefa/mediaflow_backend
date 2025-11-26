# MediaFlow CRM Backend - Quick Start Guide

## 🚀 Getting Started in 15 Minutes

This guide will help you set up the development environment and run the backend server.

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js** v20+ ([Download](https://nodejs.org/))
- **PostgreSQL** v15+ ([Download](https://www.postgresql.org/download/))
- **Redis** (Optional for development) ([Download](https://redis.io/download))
- **Git** ([Download](https://git-scm.com/))
- **Code Editor** (VS Code recommended)

---

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

This will install all required packages including:
- Express.js
- Prisma ORM
- TypeScript
- Security packages
- And more...

---

## Step 2: Database Setup

### Option A: Local PostgreSQL (Recommended for Development)

1. **Install PostgreSQL** (if not already installed)

2. **Create Database**
   ```bash
   # On Windows (PowerShell as Admin)
   psql -U postgres
   
   # Or on Linux/Mac
   sudo -u postgres psql
   ```

3. **Run these SQL commands:**
   ```sql
   CREATE DATABASE mediaflow_crm;
   CREATE USER mediaflow WITH PASSWORD 'dev_password_123';
   GRANT ALL PRIVILEGES ON DATABASE mediaflow_crm TO mediaflow;
   \q
   ```

### Option B: Using Docker (Easier)

```bash
# Run PostgreSQL in Docker
docker run --name mediaflow-postgres \
  -e POSTGRES_PASSWORD=dev_password_123 \
  -e POSTGRES_USER=mediaflow \
  -e POSTGRES_DB=mediaflow_crm \
  -p 5432:5432 \
  -d postgres:15
```

---

## Step 3: Environment Configuration

1. **Copy the example environment file:**
   ```bash
   copy .env.example .env
   ```

2. **Edit `.env` file with your settings:**
   ```env
   NODE_ENV=development
   PORT=4000

   # Database
   DATABASE_URL=postgresql://mediaflow:dev_password_123@localhost:5432/mediaflow_crm

   # JWT Secrets (use different values in production!)
   JWT_SECRET=dev_jwt_secret_change_in_production
   JWT_REFRESH_SECRET=dev_refresh_secret_change_in_production
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d

   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   CORS_ORIGIN=http://localhost:3000

   # File Upload
   UPLOAD_DIR=./uploads
   MAX_FILE_SIZE=104857600

   # Email (Optional for development)
   SMTP_HOST=smtp.mailtrap.io
   SMTP_PORT=2525
   SMTP_USER=your_username
   SMTP_PASS=your_password
   FROM_EMAIL=noreply@mediaflow.local

   # Redis (Optional for development)
   REDIS_URL=redis://localhost:6379
   ```

---

## Step 4: Database Migration

### Run Existing Migrations

```bash
# Copy migrations from frontend to backend
# (We'll use your existing Supabase migrations)

# Then run Prisma introspection
npx prisma db pull

# Generate Prisma Client
npx prisma generate
```

### Alternative: Manual Migration

```bash
# If you want to run SQL migrations manually
psql -U mediaflow -d mediaflow_crm -f ../front-end/supabase/migrations/20251017183058_create_mediaflow_schema.sql
# Repeat for other migration files...
```

---

## Step 5: Build and Run

### Development Mode (with hot reload)

```bash
npm run dev
```

The server will start at `http://localhost:4000`

### Production Build

```bash
npm run build
npm start
```

---

## Step 6: Verify Installation

### Test the API

1. **Health Check**
   ```bash
   curl http://localhost:4000/api/health
   ```
   
   Expected response:
   ```json
   {
     "status": "ok",
     "timestamp": "2025-11-26T10:30:00.000Z",
     "uptime": 42.5,
     "database": "connected"
   }
   ```

2. **API Documentation**
   
   Open in browser: `http://localhost:4000/api/docs`

---

## Common Issues & Solutions

### Issue 1: Database Connection Failed

**Error:** `Can't reach database server at localhost:5432`

**Solution:**
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists: `psql -U postgres -l`

### Issue 2: Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::4000`

**Solution:**
```bash
# On Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# On Linux/Mac
lsof -ti:4000 | xargs kill -9
```

### Issue 3: Prisma Client Not Generated

**Error:** `Cannot find module '@prisma/client'`

**Solution:**
```bash
npx prisma generate
```

### Issue 4: TypeScript Errors

**Solution:**
```bash
npm run typecheck
```

---

## Development Workflow

### 1. Create New Feature

```bash
# 1. Create route file
src/routes/feature.routes.ts

# 2. Create controller
src/controllers/feature.controller.ts

# 3. Create service
src/services/feature.service.ts

# 4. Create validator
src/validators/feature.validator.ts

# 5. Register route in src/routes/index.ts
```

### 2. Database Changes

```bash
# After modifying schema
npx prisma migrate dev --name description_of_change

# Regenerate Prisma Client
npx prisma generate
```

### 3. Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/tests/auth.test.ts

# Watch mode
npm test -- --watch
```

### 4. Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

---

## Testing API Endpoints

### Using cURL

```bash
# Register new user
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'

# Get current user (protected route)
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Using Postman

1. Import the Postman collection: `docs/MediaFlow_API.postman_collection.json`
2. Set environment variables
3. Start testing!

---

## Useful Commands

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run dev:debug        # Start with debugger

# Production
npm run build            # Build TypeScript to JavaScript
npm start                # Run production build
npm run start:prod       # Build and run

# Database
npm run prisma:studio    # Open Prisma Studio (database GUI)
npm run prisma:migrate   # Run migrations
npm run prisma:seed      # Seed database with sample data

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier
npm run typecheck        # Check TypeScript types

# Testing
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report

# Logs
npm run logs             # View application logs
npm run logs:error       # View error logs only
```

---

## Project Structure Quick Reference

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   ├── validators/      # Request validation schemas
│   ├── utils/           # Helper functions
│   ├── types/           # TypeScript types
│   ├── prisma/          # Database schema & migrations
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── tests/               # Test files
├── uploads/             # File uploads (development)
├── logs/                # Application logs
├── .env                 # Environment variables (gitignored)
└── package.json         # Dependencies
```

---

## Next Steps

Now that your backend is running, you can:

1. **✅ Review the main implementation plan**: [BACKEND_IMPLEMENTATION_PLAN.md](./BACKEND_IMPLEMENTATION_PLAN.md)

2. **🔧 Start implementing features**: Begin with Phase 1 (Core Infrastructure)

3. **📚 Read API documentation**: Check `http://localhost:4000/api/docs`

4. **🧪 Write tests**: Add tests in the `tests/` directory

5. **🔒 Configure security**: Review security settings in `src/config/`

6. **📧 Setup email**: Configure SMTP settings for notifications

---

## Getting Help

- **Documentation**: Check the `docs/` folder
- **API Reference**: `http://localhost:4000/api/docs`
- **Issues**: Review common issues section above
- **Logs**: Check `logs/` directory for detailed error messages

---

## Development Tips

### VS Code Extensions

Install these for better development experience:
- ESLint
- Prettier
- Prisma
- REST Client
- GitLens
- Error Lens

### VS Code Settings

Add to `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma"
  }
}
```

### Git Hooks (Optional)

```bash
# Install husky for git hooks
npm install -D husky lint-staged
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint-staged"
```

---

**Happy coding! 🚀**

For detailed implementation guidance, see [BACKEND_IMPLEMENTATION_PLAN.md](./BACKEND_IMPLEMENTATION_PLAN.md)
