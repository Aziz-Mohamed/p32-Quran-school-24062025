# Contributing Guide

Thank you for your interest in contributing to Quran School. This guide covers conventions, workflows, and patterns to follow.

## How to Contribute

1. Fork the repository
2. Create a feature branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. Make your changes following the conventions below
4. Run tests: `npm test`
5. Run lint: `npm run lint`
6. Commit using Conventional Commits format
7. Push and open a Pull Request against `main`

## Code Style and Conventions

### TypeScript

- **Strict mode** is enabled (`"strict": true` in tsconfig)
- **Path aliases**: `@/*` maps to `src/*`
  ```typescript
  import { supabase } from '@/lib/supabase';
  import type { Tables } from '@/types/database.types';
  ```
- Prefer `import type` for type-only imports
- No `any` — use `unknown` and narrow with type guards if needed

### Feature Colocation

Every feature lives in `src/features/<name>/` with this structure:

```
src/features/<name>/
  components/          # React components (PascalCase.tsx)
  hooks/               # use<Name>.ts — TanStack Query wrappers
  services/            # <name>.service.ts — class-based singleton
  types/               # <name>.types.ts
  utils/               # Pure functions
  index.ts             # Barrel exports (public API)
```

Rules:
- `index.ts` is the **only import target** for external consumers (screens in `app/`)
- Keep internal implementation details unexported
- Services are class-based singletons: `export const fooService = new FooService()`
- Hooks follow the `use<Entity><Action>` pattern: `useMarkBulkAttendance`, `useAttendanceCalendar`

### Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Component files | PascalCase.tsx | `RevisionSheet.tsx` |
| Hook files | camelCase.ts | `useAttendance.ts` |
| Service files | kebab-case.service.ts | `attendance.service.ts` |
| Type files | kebab-case.types.ts | `auth.types.ts` |
| Utility files | kebab-case.ts | `freshness-colors.ts` |
| Test files | `*.test.ts` / `*.test.tsx` | `helpers.test.ts` |
| Store files | camelCaseStore.ts | `authStore.ts` |
| Translation keys | dot.separated.camelCase | `auth.loginButton` |

### Shadows (Critical)

React Native shadows must use `boxShadow` (available since RN 0.76):

```typescript
// Correct — works on iOS, Android, and web
boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.08)'
```

**Never** use `elevation` (causes inner-shadow artifacts on Android with `overflow: 'hidden'`).

**Never** use iOS-only `shadowColor`/`shadowOffset`/`shadowOpacity`/`shadowRadius` (no effect on Android).

## Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>
```

**Types**: `feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`, `perf`, `ci`, `build`, `revert`

**Scope** is optional but encouraged — use the feature name or area:

```
feat(student): add revision schedule to dashboard
fix(attendance): prevent duplicate check-ins for same session
refactor(hooks): extract shared query logic into useSchoolQuery
docs(readme): add architecture overview section
test(stores): add authStore persistence tests
chore(deps): bump expo to ~54
```

Rules:
- Description must be **lowercase**, **imperative**, and **concise**
- Explain the "why", not just the "what"
- Never write vague messages like "update files", "fix stuff", or "misc updates"

## Pull Request Guidelines

- **One feature or fix per PR** — keep PRs focused and reviewable
- Title follows the commit convention: `feat(scope): description`
- Description should include:
  - What changed and why
  - Screenshots for UI changes
  - How to test the changes
- All tests must pass (`npm test`)
- Lint must pass (`npm run lint`)

## How to Add a New Feature

### 1. Create the feature directory

```bash
mkdir -p src/features/my-feature/{components,hooks,services,types,utils}
```

### 2. Define types

```typescript
// src/features/my-feature/types/my-feature.types.ts
import type { Tables } from '@/types/database.types';

export type MyEntity = Tables<'my_table'>;

export interface MyEntityFilters {
  schoolId: string;
  status?: string;
}
```

### 3. Create the service

```typescript
// src/features/my-feature/services/my-feature.service.ts
import { supabase } from '@/lib/supabase';

class MyFeatureService {
  async getItems(schoolId: string) {
    return supabase
      .from('my_table')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false });
  }

  async createItem(input: { school_id: string; name: string }) {
    return supabase
      .from('my_table')
      .insert(input)
      .select()
      .single();
  }
}

export const myFeatureService = new MyFeatureService();
```

### 4. Create hooks

```typescript
// src/features/my-feature/hooks/useMyFeature.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { myFeatureService } from '../services/my-feature.service';

export function useMyFeatureItems(schoolId: string | undefined) {
  return useQuery({
    queryKey: ['my-feature', schoolId],
    queryFn: async () => {
      const { data, error } = await myFeatureService.getItems(schoolId!);
      if (error) throw error;
      return data;
    },
    enabled: !!schoolId,
  });
}

export function useCreateMyFeatureItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { school_id: string; name: string }) =>
      myFeatureService.createItem(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-feature'] });
    },
  });
}
```

### 5. Create the barrel export

```typescript
// src/features/my-feature/index.ts
export { myFeatureService } from './services/my-feature.service';
export { useMyFeatureItems, useCreateMyFeatureItem } from './hooks/useMyFeature';
export type { MyEntity, MyEntityFilters } from './types/my-feature.types';
```

### 6. Add route screens

Create screens in `app/(<role>)/` that import from the feature's `index.ts`.

## How to Add a New Migration

1. Create a new file with the next sequential number:
   ```
   supabase/migrations/00004_descriptive_name.sql
   ```

2. Write your SQL. Key rules:
   - All school-scoped tables **must** have `school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE`
   - All new tables **must** have RLS enabled:
     ```sql
     ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;
     ```
   - Add RLS policies using `get_user_school_id()` and `get_user_role()`
   - All functions **must** have `SET search_path = public`
   - All FKs need explicit `ON DELETE` (CASCADE for ownership, SET NULL for optional)
   - Add CHECK constraints for enum-like text columns and numeric ranges

3. Apply locally:
   ```bash
   supabase db reset
   ```

4. Regenerate TypeScript types:
   ```bash
   supabase gen types typescript --local > supabase/types/database.types.ts
   cp supabase/types/database.types.ts src/types/database.types.ts
   ```

5. Verify in Supabase Studio: http://127.0.0.1:54323

See [DATABASE.md](DATABASE.md) for the full schema reference.

## How to Add a New Edge Function

1. Create the function directory and entry point:
   ```bash
   mkdir supabase/functions/my-function
   ```

2. Create `supabase/functions/my-function/index.ts`:
   ```typescript
   import "jsr:@supabase/functions-js/edge-runtime.d.ts";

   const corsHeaders = {
     "Access-Control-Allow-Origin": "*",
     "Access-Control-Allow-Headers":
       "authorization, x-client-info, apikey, content-type",
   };

   Deno.serve(async (req: Request) => {
     if (req.method === "OPTIONS") {
       return new Response("ok", { headers: corsHeaders });
     }

     try {
       const input = await req.json();

       // Your function logic here

       return new Response(
         JSON.stringify({ success: true }),
         {
           headers: { ...corsHeaders, "Content-Type": "application/json" },
         }
       );
     } catch (err) {
       return new Response(
         JSON.stringify({ error: err.message }),
         {
           status: 500,
           headers: { ...corsHeaders, "Content-Type": "application/json" },
         }
       );
     }
   });
   ```

3. Test locally:
   ```bash
   supabase functions serve my-function
   ```

4. Deploy:
   ```bash
   supabase functions deploy my-function
   ```

For functions that need admin access, use `SUPABASE_SERVICE_ROLE_KEY` (available automatically in Edge Functions).

## How to Add Translations

1. Add keys to `src/i18n/en.json` (English)
2. Add the corresponding keys to `src/i18n/ar.json` (Arabic)
3. Follow the key naming convention: `feature.section.element`
   ```json
   {
     "myFeature": {
       "title": "My Feature",
       "emptyState": "No items found"
     }
   }
   ```

4. Use in components:
   ```typescript
   import { useTranslation } from 'react-i18next';

   const { t } = useTranslation();
   return <Text>{t('myFeature.title')}</Text>;
   ```

5. For localized database fields, use the JSONB pattern:
   ```sql
   name_localized JSONB NOT NULL DEFAULT '{}'::jsonb
   ```
   With values like `{ "en": "English Name", "ar": "الاسم بالعربية" }`.

## Testing

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode (re-runs on file changes)
npm run test:coverage # Generate coverage report
```

### Test Location

Test files live alongside their source files:

```
src/lib/helpers.ts
src/lib/helpers.test.ts

src/stores/authStore.ts
src/stores/authStore.test.ts
```

### What to Test

- **Pure utility functions** (highest value, easiest to test)
- **Store logic** (state transitions, persistence)
- **Service methods** (mock Supabase client)

### Test Configuration

- Framework: Jest with `jest-expo` preset
- Path aliases (`@/`) work via `moduleNameMapper` in `jest.config.js`
- Coverage excludes: `*.d.ts`, `types/`, `i18n/`
