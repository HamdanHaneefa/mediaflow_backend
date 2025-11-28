# Updated Prisma Schema Instructions

## How to Update Your schema.prisma File

After running the SQL migration, you need to update your Prisma schema to match the new database structure.

## Quick Update Steps

### 1. Add New Fields to Existing Models

#### Update `projects` model:
```prisma
model projects {
  id           String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  title        String
  name         String   // NEW: Added for frontend compatibility
  description  String?
  type         String   @default("Commercial")
  status       String   @default("Active")
  phase        String   @default("Pre-production")
  priority     String   @default("Medium")  // NEW
  client_id    String?  @db.Uuid
  budget       Decimal? @db.Decimal(12, 2)
  spent        Decimal? @db.Decimal(12, 2)  // NEW
  progress     Int      @default(0)         // NEW (0-100)
  start_date   DateTime? @db.Date
  end_date     DateTime? @db.Date
  team_members String[] @default([]) @db.Uuid
  created_at   DateTime @default(now()) @db.Timestamptz(6)
  updated_at   DateTime @default(now()) @db.Timestamptz(6)

  // Relations (existing + new)
  client               contacts?                  @relation("ClientProjects", fields: [client_id], references: [id], onDelete: SetNull)
  tasks                tasks[]
  expenses             expenses[]
  income               income[]
  proposals            proposals[]
  events               events[]
  assets               assets[]
  project_milestones   project_milestones[]       // NEW
  project_files        project_files[]            // NEW
  team_project_assignments team_project_assignments[]
  financial_transactions financial_transactions[]
  project_assignments  project_assignments[]
  client_messages      client_messages[]
  client_documents     client_documents[]
  project_comments     project_comments[]

  @@index([client_id])
  @@index([status])
  @@index([phase])
  @@index([priority])    // NEW
  @@index([progress])    // NEW
}
```

#### Update `contacts` model:
```prisma
model contacts {
  id           String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name         String
  first_name   String?  // NEW
  last_name    String?  // NEW
  email        String   @unique
  phone        String?
  company      String?
  position     String?  // NEW
  role         String   @default("Client")
  type         String   @default("Client")  // NEW
  status       String   @default("Active")
  avatar_url   String?  // NEW
  address      String?  // NEW
  city         String?  // NEW
  country      String?  // NEW
  notes        String?
  tags         String[] @default([])
  last_contact DateTime? @db.Timestamptz  // NEW
  created_at   DateTime @default(now()) @db.Timestamptz(6)
  updated_at   DateTime @default(now()) @db.Timestamptz(6)

  // Relations (existing + new)
  projects_as_client projects[]        @relation("ClientProjects")
  tasks_assigned     tasks[]
  income_records     income[]
  proposals          proposals[]
  client_user        client_users?
  contact_notes      contact_notes[]   // NEW

  @@index([email])
  @@index([role])
  @@index([status])
  @@index([first_name])   // NEW
  @@index([last_name])    // NEW
  @@index([type])         // NEW
  @@index([city])         // NEW
  @@index([country])      // NEW
}
```

#### Update `tasks` model:
```prisma
model tasks {
  id              String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  title           String
  description     String?
  status          String    @default("To Do")
  project_id      String?   @db.Uuid
  assigned_to     String?   @db.Uuid
  due_date        DateTime? @db.Date
  completed_at    DateTime? @db.Timestamptz  // NEW
  priority        String    @default("Medium")
  type            String    @default("Administrative")
  estimated_hours Decimal?  @db.Decimal(5, 2)  // NEW
  actual_hours    Decimal?  @db.Decimal(5, 2)  // NEW
  progress        Int       @default(0)         // NEW (0-100)
  created_at      DateTime  @default(now()) @db.Timestamptz(6)
  updated_at      DateTime  @default(now()) @db.Timestamptz(6)

  // Relations (existing + new)
  project          projects?           @relation(fields: [project_id], references: [id], onDelete: Cascade)
  assignee         contacts?           @relation(fields: [assigned_to], references: [id], onDelete: SetNull)
  task_attachments task_attachments[]  // NEW
  task_comments    task_comments[]     // NEW

  @@index([project_id])
  @@index([assigned_to])
  @@index([status])
  @@index([completed_at])  // NEW
  @@index([progress])      // NEW
}
```

### 2. Add New Models

Add these new models to your schema file (after the existing models):

```prisma
// ============================================================================
// NEW: PROJECT SUPPORT TABLES
// ============================================================================

model project_milestones {
  id             String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  project_id     String    @db.Uuid
  title          String
  description    String?
  due_date       DateTime  @db.Date
  completed_date DateTime? @db.Date
  status         String    @default("Pending")
  order_index    Int       @default(0)
  created_at     DateTime  @default(now()) @db.Timestamptz(6)
  updated_at     DateTime  @default(now()) @db.Timestamptz(6)

  // Relations
  project projects @relation(fields: [project_id], references: [id], onDelete: Cascade)

  @@index([project_id])
  @@index([status])
  @@index([due_date])
}

model project_files {
  id                String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  project_id        String   @db.Uuid
  filename          String
  original_filename String
  file_url          String
  file_type         String?
  file_size         BigInt?
  mime_type         String?
  uploaded_by       String?  @db.Uuid
  description       String?
  category          String   @default("General")
  is_public         Boolean  @default(false)
  created_at        DateTime @default(now()) @db.Timestamptz(6)

  // Relations
  project  projects      @relation(fields: [project_id], references: [id], onDelete: Cascade)
  uploader team_members? @relation(fields: [uploaded_by], references: [id], onDelete: SetNull)

  @@index([project_id])
  @@index([file_type])
  @@index([uploaded_by])
  @@index([created_at])
}

// ============================================================================
// NEW: TASK SUPPORT TABLES
// ============================================================================

model task_attachments {
  id                String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  task_id           String   @db.Uuid
  filename          String
  original_filename String
  file_url          String
  file_type         String?
  file_size         BigInt?
  mime_type         String?
  uploaded_by       String?  @db.Uuid
  created_at        DateTime @default(now()) @db.Timestamptz(6)

  // Relations
  task     tasks         @relation(fields: [task_id], references: [id], onDelete: Cascade)
  uploader team_members? @relation(fields: [uploaded_by], references: [id], onDelete: SetNull)

  @@index([task_id])
  @@index([uploaded_by])
}

model task_comments {
  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  task_id    String   @db.Uuid
  user_id    String   @db.Uuid
  comment    String   @db.Text
  created_at DateTime @default(now()) @db.Timestamptz(6)
  updated_at DateTime @default(now()) @db.Timestamptz(6)

  // Relations
  task tasks         @relation(fields: [task_id], references: [id], onDelete: Cascade)
  user team_members  @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@index([task_id])
  @@index([user_id])
  @@index([created_at])
}

// ============================================================================
// NEW: CONTACT SUPPORT TABLES
// ============================================================================

model contact_notes {
  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  contact_id String   @db.Uuid
  note       String   @db.Text
  created_by String?  @db.Uuid
  created_at DateTime @default(now()) @db.Timestamptz(6)

  // Relations
  contact contacts      @relation(fields: [contact_id], references: [id], onDelete: Cascade)
  creator team_members? @relation(fields: [created_by], references: [id], onDelete: SetNull)

  @@index([contact_id])
  @@index([created_at])
}
```

### 3. Update team_members relations

Add these new relations to your `team_members` model:

```prisma
model team_members {
  // ... existing fields ...

  // Relations (add these NEW ones to existing)
  project_files_uploaded    project_files[]       @relation   // NEW
  task_attachments_uploaded task_attachments[]    // NEW
  task_comments_created     task_comments[]       // NEW
  contact_notes_created     contact_notes[]       // NEW
  
  // ... rest of existing relations ...
}
```

## After Updating the Schema

1. **Validate the schema:**
   ```bash
   cd backend
   npx prisma validate
   ```

2. **Format the schema:**
   ```bash
   npx prisma format
   ```

3. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

4. **Verify database matches schema:**
   ```bash
   npx prisma db pull
   # This will show if there are any differences
   ```

5. **Test the changes:**
   ```bash
   npm run dev
   ```

## Troubleshooting

If you get errors:

1. **"Field not found" error:**
   - Make sure you ran the SQL migration first
   - Check field names match exactly (case-sensitive)

2. **"Relation does not exist" error:**
   - Check foreign key constraints exist in database
   - Verify table names are correct

3. **"Type mismatch" error:**
   - Check data types match between schema and database
   - Common: `BigInt` vs `Int`, `Date` vs `DateTime`

## Full Schema File

If you want to replace your entire schema.prisma file, I can generate the complete file with all changes integrated. Let me know!
