# Team Relations Fix

## Issue
The team service was using incorrect Prisma relation names that don't match the database schema, causing validation errors:

```
Unknown field `team` for include statement on model `team_members`. Available options are marked with ?.
```

## Root Cause
When Prisma generates the client from the schema, it creates relation field names based on the foreign key constraint names in the database. The relations were using simplified names (`team`, `manager`, `members`, `project_assignments`, `managed_teams`) but the actual generated relation names are more verbose.

## Fixed Relation Names

### For `team_members` model:
- ❌ `team` → ✅ `teams_team_members_team_idToteams`
- ❌ `project_assignments` → ✅ `project_assignments_project_assignments_team_member_idToteam_members`
- ❌ `managed_teams` → ✅ `teams_teams_manager_idToteam_members`

### For `teams` model:
- ❌ `manager` → ✅ `team_members_teams_manager_idToteam_members`
- ❌ `members` → ✅ `team_members_team_members_team_idToteams`

## Files Modified
- `backend/src/services/team.service.ts` - Fixed all Prisma relation references

## Changes Made

### 1. `createTeamMember()` - Line 53
```typescript
// Before
include: {
  team: { select: { ... } }
}

// After
include: {
  teams_team_members_team_idToteams: { select: { ... } }
}
```

### 2. `getTeamMember()` - Line 76
```typescript
// Before
include: {
  team: { ... },
  project_assignments: { ... },
  managed_teams: { ... }
}

// After
include: {
  teams_team_members_team_idToteams: { ... },
  project_assignments_project_assignments_team_member_idToteam_members: { ... },
  teams_teams_manager_idToteam_members: { ... }
}
```

### 3. `listTeamMembers()` - Line 180
```typescript
// Before
include: {
  team: { ... },
  _count: {
    select: {
      project_assignments: true,
      managed_teams: true
    }
  }
}

// After
include: {
  teams_team_members_team_idToteams: { ... },
  _count: {
    select: {
      project_assignments_project_assignments_team_member_idToteam_members: true,
      teams_teams_manager_idToteam_members: true
    }
  }
}
```

### 4. `updateTeamMember()` - Line 251
Fixed relation name in include statement

### 5. `deleteTeamMember()` - Line 270
```typescript
// Before
_count: {
  select: {
    project_assignments: true,
    managed_teams: true
  }
}

// After
_count: {
  select: {
    project_assignments_project_assignments_team_member_idToteam_members: true,
    teams_teams_manager_idToteam_members: true
  }
}
```

### 6. `createTeam()` - Line 404
```typescript
// Before
include: {
  manager: { ... },
  _count: { select: { members: true, ... } }
}

// After
include: {
  team_members_teams_manager_idToteam_members: { ... },
  _count: { select: { team_members_team_members_team_idToteams: true, ... } }
}
```

### 7. `getTeam()` - Line 428
```typescript
// Before
include: {
  manager: { ... },
  members: { ... }
}

// After
include: {
  team_members_teams_manager_idToteam_members: { ... },
  team_members_team_members_team_idToteams: { ... }
}
```

### 8. `listTeams()` - Line 506
Fixed manager and members relation names

### 9. `updateTeam()` - Line 553
Fixed manager relation name

### 10. `deleteTeam()` - Line 578
Fixed members count relation name

## Testing
After this fix, the team member creation endpoint should work correctly:

```bash
POST /api/team/members
{
  "email": "alan@gmail.com",
  "first_name": "Sharath",
  "last_name": "N/A",
  "phone": "07306827008",
  "role": "member"
}
```

## Prevention
To avoid this issue in the future:
1. Always check the generated Prisma client types when writing queries
2. Use TypeScript autocomplete to see available relation names
3. Consider using `@@map` in schema.prisma to create more user-friendly relation names

## Status
✅ **FIXED** - All team service operations now use correct Prisma relation names
