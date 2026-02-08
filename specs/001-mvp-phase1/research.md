# Technical Research: Quran School MVP (Phase 1)

**Feature**: `001-mvp-phase1` | **Date**: 2026-02-08 | **Status**: Resolved

## Overview

All technical decisions for Phase 1 have been resolved through specification clarification. This document records the decisions, alternatives considered, and rationale for each.

---

## Decision 1: Authentication Model

**Question**: How do users authenticate — email-based or username-based?

**Decision**: Username-based login with synthetic emails for Supabase Auth compatibility.

**How it works**:
1. Users log in with `username` + `password`. They never see an email address.
2. Internally, the system maps each username to a synthetic email: `username@school-slug.app`.
3. Supabase Auth stores the synthetic email in `auth.users.email`. The `profiles` table stores the human-readable `username`.
4. School creation is the only self-service flow — the creator becomes admin. All other accounts are created by the admin via an Edge Function.

**Alternatives rejected**:
- **Email-based auth**: Target users (children, teachers at mosque schools) often lack personal emails. Would add friction.
- **Phone-based auth**: SMS verification adds cost and complexity. Not justified for ~50 users per school.
- **Magic link**: Requires email delivery infrastructure. Excluded from Phase 1.

**Impact on codebase**:
- `profiles` table needs a `username` column (TEXT, NOT NULL, with UNIQUE constraint scoped to school via a unique index on `(school_id, username)`)
- Existing `login.tsx` changes from email field to username field
- `register.tsx` becomes `create-school.tsx`
- `forgot-password.tsx` removed (admin resets passwords in-app)
- Auth service needs `buildSyntheticEmail(username, schoolSlug)` helper

---

## Decision 2: Account Creation via Edge Functions

**Question**: How does the admin create accounts for teachers, students, and parents?

**Decision**: Two Supabase Edge Functions handle account creation securely.

### Edge Function: `create-school`
- **Trigger**: User taps "Create a School" on first launch
- **Input**: School name, admin full name, username, password
- **Process**:
  1. Generate school slug from name (lowercase, hyphenated, deduped)
  2. Build synthetic email: `username@school-slug.app`
  3. Call `auth.admin.createUser()` with synthetic email, password, and metadata (`school_id`, `role: 'admin'`, `full_name`)
  4. Create school record with the new user as owner
  5. The `handle_new_profile()` trigger auto-creates the profile
- **Returns**: Session tokens + school details
- **Auth**: No JWT required (public endpoint)

### Edge Function: `create-member`
- **Trigger**: Admin creates a student, teacher, or parent from the admin panel
- **Input**: Full name, username, password, role, school_id, optional: class_id, parent_id, date_of_birth
- **Process**:
  1. Verify caller is admin of the target school
  2. Build synthetic email: `username@school-slug.app`
  3. Call `auth.admin.createUser()` with metadata
  4. Trigger creates profile; Edge Function creates role-specific record (students row, etc.)
- **Returns**: Created user profile
- **Auth**: Requires valid JWT with admin role

### Edge Function: `reset-member-password`
- **Trigger**: Admin resets a member's password from the admin panel
- **Input**: Target user ID, new password
- **Process**:
  1. Verify caller is admin and target user is in the same school
  2. Call `auth.admin.updateUserById()` with new password
- **Returns**: Success confirmation
- **Auth**: Requires valid JWT with admin role

**Why Edge Functions**: `auth.admin.createUser()` requires the `service_role` key which must never be exposed to the client. Edge Functions run server-side with access to this key.

**Alternatives rejected**:
- **Client-side `signUp()`**: Would allow self-registration, bypassing admin control. Also can't set role metadata securely.
- **Database function with `pg_net`**: Over-complex for this use case; Edge Functions are the Supabase-recommended pattern.

---

## Decision 3: Username Auto-Generation

**Question**: How are usernames generated when the admin creates an account?

**Decision**: Auto-generate from full name with random digits.

**Pattern**: `{fullname_lowercase_no_spaces}_{3_random_digits}`
- Example: "Ahmed Ali" -> `ahmedali_342`
- Arabic names are transliterated if the admin enters them in Latin script (expected for usernames)

**UX flow**:
1. Admin enters the member's full name
2. System auto-generates a username suggestion
3. Admin can:
   - Accept the suggestion as-is
   - Tap "refresh" to regenerate random digits
   - Manually edit the username
4. System validates uniqueness within the school before saving

**Uniqueness scope**: Per-school only. Two schools can have the same username because the synthetic email includes the school slug (`ahmedali_342@school-a.app` vs `ahmedali_342@school-b.app`).

**Collision handling**: With 3 random digits (000-999), 1000 combinations per name. At ~50 users per school, collision probability is negligible. If a collision occurs, the admin taps refresh or edits manually.

---

## Decision 4: Points Calculation Timing

**Question**: Are gamification points calculated synchronously or asynchronously?

**Decision**: Synchronous — points update in the same transaction as the triggering action.

**Implementation**: PostgreSQL trigger functions on:
- `sessions` INSERT -> +10 points (session completed) + conditional +5 (recitation score >= 4)
- `homework` UPDATE (is_completed = true) -> +10 (on time) or +5 (late, based on due_date vs completed_at)
- `student_stickers` INSERT -> + sticker's `points_value`
- `attendance` INSERT (status = 'present') -> streak check -> +3/day for consecutive streak, +20 for perfect weekly attendance

**How it works**:
1. Trigger fires AFTER INSERT/UPDATE on the relevant table
2. Trigger function calculates points earned
3. Updates `students.total_points` atomically (`total_points = total_points + earned`)
4. Recalculates `students.current_level` based on new total vs `levels.points_required`
5. All within the same transaction — the client sees updated values immediately

**Alternatives rejected**:
- **Client-side calculation**: Race conditions, inconsistency, can be cheated
- **Background job / queue**: Over-engineering for ~50 users. Adds latency the user would notice ("why didn't my points update?")
- **Supabase Realtime subscription**: Would still need server-side calculation; just adds a notification layer

**Tradeoff**: Synchronous triggers add ~10-50ms to write operations. Acceptable at ~50 users per school.

---

## Decision 5: Leaderboard Definition

**Question**: What does "weekly" mean on the leaderboard?

**Decision**: Rolling 7-day window.

**Implementation**:
- **Weekly view**: `WHERE created_at >= NOW() - INTERVAL '7 days'` on points-earning events
- **All-time view**: Uses `students.total_points` directly (no time filter)
- **Scope**: Class-level (students in the same class)
- **Display**: Top 10 students + current student's rank (even if outside top 10)
- **Parent view**: Anonymous — shows ranks only, no other students' names

**How weekly points are calculated**: Sum of all points earned from sessions, homework, stickers, and attendance in the last 7 days. This requires a `points_log` or derivation from the source tables:
- Query `sessions` (created_at in last 7 days) -> sum session points
- Query `homework` (completed_at in last 7 days) -> sum homework points
- Query `student_stickers` (awarded_at in last 7 days) -> sum sticker points
- Query `attendance` (date in last 7 days, status = present) -> sum attendance points

**Alternatives rejected**:
- **Fixed calendar week (Mon-Sun)**: Less intuitive — a student who earns points on Friday would "lose" them on Monday regardless of recency.
- **Monthly window**: Too long; reduces urgency and engagement.

---

## Decision 6: Schema Changes Required

Based on the decisions above, the following schema changes are needed on top of the existing `00001_initial_schema.sql`:

### Migration: `00002_add_username_and_points_triggers`

1. **Add `username` column to `profiles`**:
   ```sql
   ALTER TABLE profiles ADD COLUMN username TEXT;
   CREATE UNIQUE INDEX idx_profiles_school_username ON profiles(school_id, username);
   ```
   Note: `username` is nullable initially to support the migration. New accounts always have a username set by the Edge Function.

2. **Points trigger function**: `handle_session_points()` — fires AFTER INSERT on `sessions`
3. **Points trigger function**: `handle_homework_points()` — fires AFTER UPDATE on `homework` (when `is_completed` changes to true)
4. **Points trigger function**: `handle_sticker_points()` — fires AFTER INSERT on `student_stickers`
5. **Level update function**: `update_student_level()` — called by points triggers after updating total_points

---

## Decision 7: Existing Code Adaptation

The existing codebase has scaffolding that needs modification:

| File | Current State | Required Change |
|------|--------------|-----------------|
| `src/features/auth/auth.types.ts` | `LoginInput` uses `email` | Change to `username` + add `schoolSlug` (for building synthetic email) |
| `src/features/auth/auth.service.ts` | Uses `signInWithPassword` with email | Add `buildSyntheticEmail()`, login with synthetic email behind the scenes |
| `app/(auth)/login.tsx` | Email + password form | Username + password form (no email field) |
| `app/(auth)/register.tsx` | Registration form | Rename to `create-school.tsx`, different fields |
| `app/(auth)/forgot-password.tsx` | Email-based reset | Remove entirely |
| `src/lib/constants.ts` | `LEVELS` has 9 entries | Verify alignment with DB seed (10 levels) |

---

## Open Questions (None)

All technical questions have been resolved through the clarification process. No blockers for proceeding to data model and contracts.
