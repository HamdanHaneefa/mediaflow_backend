# Leads Table Migration Complete

## Problem
The application was trying to create leads, but the `leads` table didn't exist in the database, causing a Prisma validation error:
```
Argument `creator` is missing.
```

## Solution
Added the complete `leads` model to the Prisma schema with all necessary fields and relations.

### Schema Changes

#### 1. Added `leads` model
```prisma
model leads {
  id                    String       @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name                  String
  email                 String
  phone                 String?
  company               String?
  source                String?
  status                String       @default("New")
  priority              String?
  score                 Int          @default(0)
  budget                Decimal?     @db.Decimal(12, 2)
  project_type          String?
  timeline              String?
  notes                 String?
  tags                  String[]     @default([])
  contact_date          DateTime?    @db.Timestamptz(6)
  follow_up_date        DateTime?    @db.Timestamptz(6)
  estimated_close_date  DateTime?    @db.Date
  created_by            String       @db.Uuid
  converted_contact_id  String?      @db.Uuid
  converted_at          DateTime?    @db.Timestamptz(6)
  created_at            DateTime     @default(now()) @db.Timestamptz(6)
  updated_at            DateTime     @default(now()) @db.Timestamptz(6)
  creator               team_members @relation("leads_created_by", fields: [created_by], references: [id], onDelete: Cascade)
  converted_contact     contacts?    @relation("leads_converted_to_contact", fields: [converted_contact_id], references: [id])
  proposals             proposals[]

  @@index([created_by])
  @@index([status])
  @@index([email])
  @@index([converted_contact_id])
}
```

#### 2. Updated `team_members` model
Added relation to created leads:
```prisma
created_leads leads[] @relation("leads_created_by")
```

#### 3. Updated `proposals` model
Added lead_id field and relation:
```prisma
lead_id String? @db.Uuid
lead    leads?  @relation(fields: [lead_id], references: [id])

@@index([lead_id])
```

#### 4. Updated `contacts` model
Added reverse relation for converted leads:
```prisma
converted_from_leads leads[] @relation("leads_converted_to_contact")
```

#### 5. Fixed `task_comments` model
Fixed missing field name in relation (was causing schema validation error):
```prisma
// Before:
team_members @relation(...)

// After:
team_members team_members @relation(...)
```

### Service Changes

#### `backend/src/services/proposals.service.ts`
Simplified the `LeadService.create()` method to accept `created_by` in the data object:

```typescript
// Before:
async create(data: any, createdBy: string) {
  const lead = await prisma.leads.create({
    data: {
      ...data,
      created_by: createdBy, // This was always undefined
    },
  });
}

// After:
async create(data: any) {
  const lead = await prisma.leads.create({
    data: {
      ...data, // created_by comes from data object
      status: data.status || 'New',
      score: data.score || 0,
    },
  });
}
```

The controller already passes `created_by` in the data:
```typescript
const lead = await leadService.create({ ...req.body, created_by: userId });
```

## Migration Applied
Migration name: `20251130174112_add_leads_table`

The database was reset and migrations were reapplied to add the leads table with all relations.

## Testing
1. Start the backend server
2. Try creating a lead through the UI or API
3. Verify the lead is created successfully

Example API call:
```bash
curl -X POST http://localhost:4000/api/proposals/leads \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Lead",
    "email": "test@example.com",
    "phone": "1234567890",
    "company": "Test Company",
    "source": "Website",
    "status": "New"
  }'
```

## Notes
- The `created_by` field is required and must reference a valid `team_members.id`
- Leads can be converted to contacts using the `converted_contact_id` field
- Leads can have associated proposals through the `proposals` relation
