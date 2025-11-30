# Validation Middleware Fix

## Problem
The proposals routes were returning a 422 validation error: `[{"field":"body","message":"Required"}]` when trying to create leads.

## Root Cause
The issue was a mismatch between the validation middleware used and the schema structure:

1. **Two validation middlewares exist:**
   - `validate(schema)` - expects schemas with `{ body, query, params }` wrappers
   - `validateRequest(schema, source)` - when source is 'body' (default), expects schemas that validate ONLY the body content directly

2. **The proposals routes were using `validateRequest()`** but the schemas had `{ body: ... }` wrappers, causing a mismatch.

3. **The validation looked for `req.body.body.name`** instead of `req.body.name`, causing the validation to fail with "body is required".

## Solution
Changed all proposals routes from `validateRequest()` to `validate()` to match the schema structure with body/params/query wrappers.

### Files Modified

#### 1. `backend/src/routes/proposals.routes.ts`
- Changed import from `validateRequest` to `validate`
- Updated all route validations from `validateRequest(schema)` to `validate(schema)`

Before:
```typescript
router.post('/leads', authenticate, validateRequest(createLeadSchema), createLead);
```

After:
```typescript
router.post('/leads', authenticate, validate(createLeadSchema), createLead);
```

#### 2. `backend/src/validators/proposals.validator.ts`
- Added missing `updateProposalStatusSchema` that was referenced in routes but didn't exist

## Pattern to Follow

For consistency across the codebase:

### Use `validate()` when schemas have wrappers:
```typescript
const createLeadSchema = z.object({
  body: z.object({
    name: z.string(),
    email: z.string().email(),
  }),
});

router.post('/leads', authenticate, validate(createLeadSchema), createLead);
```

### Use `validateBody()` when schema validates body directly:
```typescript
const createLeadSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

router.post('/leads', authenticate, validateBody(createLeadSchema), createLead);
```

### Use `validateQuery()` for query params:
```typescript
const listLeadsSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
});

router.get('/leads', authenticate, validateQuery(listLeadsSchema), listLeads);
```

### Use `validateRequest()` as an alias (backward compatibility):
```typescript
// Defaults to 'body'
router.post('/leads', authenticate, validateRequest(createLeadSchema, 'body'), createLead);

// For query params
router.get('/leads', authenticate, validateRequest(listLeadsSchema, 'query'), listLeads);
```

## Testing
Test the lead creation endpoint:
```bash
curl -X POST http://localhost:4000/api/proposals/leads \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Lead","email":"test@example.com"}'
```

Should now return success instead of 422 validation error.
