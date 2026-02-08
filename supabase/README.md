# Supabase Setup & Migration Guide

## Current Status

✅ **TypeScript Types Generated**: `types/database.types.ts`
✅ **Schema Reference Created**: `SCHEMA_REFERENCE.md`
✅ **37 Migrations Deployed**: See full list in `SCHEMA_REFERENCE.md`
⚠️ **Local Migrations Out of Sync**: The local migration file differs from deployed schema

## Available Resources

### 1. TypeScript Types (`types/database.types.ts`)
Complete TypeScript type definitions for all tables, views, functions, and enums. Import these in your application:

```typescript
import { Database, Tables } from './supabase/types/database.types'

// Use types
type Student = Tables<'students'>
type Profile = Tables<'profiles'>
```

### 2. Schema Reference (`SCHEMA_REFERENCE.md`)
Human-readable documentation of:
- All 37 migration names and versions
- Complete table listing with descriptions
- Enum definitions
- RPC function reference
- Key relationships

## Syncing Local Migrations

The local `migrations/00001_initial_schema.sql` is from a different (multi-tenant) schema design. To sync with the actual deployed schema:

### Option 1: Generate Fresh Migration (Recommended)

```bash
# Generate a migration from the current remote schema
npx supabase db pull

# This will create a new timestamped migration file that reflects
# the exact current state of your Supabase database
```

### Option 2: Manual Schema Export

```bash
# Dump the entire schema to a single file
npx supabase db dump -f supabase/schema_dump.sql

# This creates a complete snapshot of your current schema
```

### Option 3: Keep Working with TypeScript Types

The TypeScript types file (`types/database.types.ts`) is automatically generated from your live database and provides complete type safety. You can continue using these without needing local migration files.

## Development Workflow

### Regenerating Types After Schema Changes

Whenever you make changes to your database schema in Supabase:

```bash
# Using Supabase CLI
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > supabase/types/database.types.ts

# Or use the Claude Code MCP tool (already connected)
# Just ask Claude to regenerate the types
```

### Creating New Migrations

```bash
# Create a new migration file
npx supabase migration new your_migration_name

# Edit the generated file in supabase/migrations/
# Then push to Supabase
npx supabase db push
```

### Viewing Migration Status

```bash
# See which migrations have been applied
npx supabase migration list
```

## Project Configuration

Your `config.toml` contains the Supabase project configuration. The project is already linked via MCP tools, so Claude Code can:

- ✅ Query your database directly
- ✅ Generate TypeScript types
- ✅ List tables and migrations
- ✅ Execute SQL queries

## Next Steps

1. **Review the Schema Reference**: Check `SCHEMA_REFERENCE.md` to understand your database structure
2. **Sync Migrations** (Optional): Run `npx supabase db pull` if you need local migration files
3. **Import Types**: Use the TypeScript types in your application code
4. **Continue Development**: The MCP connection allows Claude to see and work with your schema directly

## Useful Commands

```bash
# Check Supabase CLI version
npx supabase --version

# Pull remote schema changes
npx supabase db pull

# Generate types
npx supabase gen types typescript --project-id YOUR_PROJECT_ID

# Create new migration
npx supabase migration new migration_name

# Push migrations to remote
npx supabase db push

# View migration history
npx supabase migration list

# Dump entire schema
npx supabase db dump -f schema_dump.sql
```

## Important Notes

- 🚫 **Don't use** the existing `migrations/00001_initial_schema.sql` - it's from a different schema design (multi-tenant with `school_id`)
- ✅ **Your deployed schema** does NOT use multi-tenancy - it's a single-school implementation
- 🔄 **Auto-sync**: Claude Code can always fetch the latest schema via MCP tools
- 📝 **Types are source of truth**: The generated TypeScript types reflect your exact current schema

## Troubleshooting

### "Migration out of sync" errors
Run `npx supabase db pull` to generate a fresh migration from your current schema.

### Need to see current schema
Check `SCHEMA_REFERENCE.md` or ask Claude Code to query specific tables/structures.

### Types not matching database
Regenerate types: ask Claude Code or run `npx supabase gen types typescript`.

---

**Generated**: 2026-02-07
**Database**: Quran School Management System
**Migrations Applied**: 37
