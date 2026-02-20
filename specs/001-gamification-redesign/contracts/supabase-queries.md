# API Contracts: Gamification Redesign

**Feature**: 001-gamification-redesign
**Date**: 2026-02-20

All data access uses Supabase JS SDK directly (per Constitution VII — no ORM/repository layer). Contracts defined as Supabase query patterns.

---

## New Service Methods

### GS-008: Get Student Rubʿ Certifications

**Purpose**: Fetch all certifications for a student (active + dormant).
**User Story**: US-3 (View Progress Map), US-1/US-2 (Teacher Certification/Revision)

```typescript
// gamification.service.ts
async getRubCertifications(studentId: string) {
  return supabase
    .from('student_rub_certifications')
    .select('*, profiles!student_rub_certifications_certified_by_fkey(full_name)')
    .eq('student_id', studentId)
    .order('rub_number');
}
```

**Returns**: Array of certification rows with teacher name join. Client computes freshness from `last_reviewed_at`, `review_count`, and current time.

**RLS**: Teacher sees class students, admin sees school, student sees own, parent sees children.

---

### GS-009: Certify a Rubʿ

**Purpose**: Teacher certifies a new rubʿ for a student.
**User Story**: US-1 (Teacher Certifies a Rubʿ)

```typescript
async certifyRub(input: {
  studentId: string;
  rubNumber: number;
  certifiedBy: string;
}) {
  return supabase
    .from('student_rub_certifications')
    .insert({
      student_id: input.studentId,
      rub_number: input.rubNumber,
      certified_by: input.certifiedBy,
      // review_count defaults to 0
      // last_reviewed_at defaults to now()
      // dormant_since defaults to NULL
    })
    .select()
    .single();
}
```

**Constraints**: UNIQUE(student_id, rub_number) prevents duplicate certification. RLS ensures only class teacher/admin can insert.

---

### GS-010: Undo Certification (Grace Period)

**Purpose**: Teacher undoes a certification within ~30 seconds.
**User Story**: US-1 Scenario 5 (Undo)

```typescript
async undoCertification(certificationId: string) {
  return supabase
    .from('student_rub_certifications')
    .delete()
    .eq('id', certificationId);
}
```

**Constraints**: Client-side timer enforces grace period. Row-level: only the certifying teacher or admin can delete.

---

### GS-011: Record Revision (Good)

**Purpose**: Teacher marks a "Good" revision. Resets freshness to 100%, increments review count.
**User Story**: US-2 Scenarios 2, 4, 5

```typescript
async recordGoodRevision(certificationId: string, isDormantRecovery: boolean, resetReviewCount: boolean) {
  const updates: Record<string, unknown> = {
    last_reviewed_at: new Date().toISOString(),
    dormant_since: null, // restore from dormancy if applicable
  };

  if (resetReviewCount) {
    // 30-90 day dormancy recovery: reset review count
    updates.review_count = 0;
  }
  // If not resetting, review_count is incremented via RPC or client-read-then-write
  // Using RPC for atomic increment:

  return supabase
    .from('student_rub_certifications')
    .update(updates)
    .eq('id', certificationId)
    .select()
    .single();
}
```

**Note**: `review_count` increment needs to be atomic. Options:
1. Use Supabase RPC: `supabase.rpc('increment_review_count', { cert_id })` — preferred for atomicity
2. Client reads current value, increments, writes — acceptable given single-teacher-per-student usage

---

### GS-012: Record Revision (Poor)

**Purpose**: Teacher marks a "Poor" revision. Resets freshness to 50%, keeps review count unchanged.
**User Story**: US-2 Scenario 3

```typescript
async recordPoorRevision(certificationId: string) {
  return supabase
    .from('student_rub_certifications')
    .update({
      last_reviewed_at: new Date().toISOString(),
      // review_count unchanged
      // dormant_since unchanged (poor revision does NOT restore dormancy)
    })
    .eq('id', certificationId)
    .select()
    .single();
}
```

**Constraint**: Poor revision on a dormant rubʿ does NOT clear `dormant_since`.

---

### GS-013: Re-Certify Dormant Rubʿ (90+ days)

**Purpose**: Teacher re-certifies a rubʿ dormant for 90+ days. Resets everything.
**User Story**: US-2 Scenario 6

```typescript
async recertifyRub(certificationId: string, certifiedBy: string) {
  return supabase
    .from('student_rub_certifications')
    .update({
      certified_by: certifiedBy,
      certified_at: new Date().toISOString(),
      review_count: 0,
      last_reviewed_at: new Date().toISOString(),
      dormant_since: null,
    })
    .eq('id', certificationId)
    .select()
    .single();
}
```

---

### GS-014: Get Rubʿ Reference Data

**Purpose**: Fetch the static 240-row Quran rubʿ reference.
**User Story**: US-3 (Progress Map)

```typescript
async getRubReference() {
  return supabase
    .from('quran_rub_reference')
    .select('*')
    .order('rub_number');
}
```

**Caching**: Infinite staleTime (data never changes). Cache once on app launch.

---

### GS-015: Batch Update Dormancy

**Purpose**: Mark newly dormant certifications on app open (lazy write-back).
**User Story**: US-4 (Freshness Decays)

```typescript
async markDormant(certificationIds: string[]) {
  return supabase
    .from('student_rub_certifications')
    .update({
      dormant_since: new Date().toISOString(),
    })
    .in('id', certificationIds);
}
```

**Called by**: Client-side hook when freshness computation detects certifications at 0%.

---

### GS-016: Update Student Level Cache

**Purpose**: Update the cached `current_level` on the students table after certification/dormancy changes.

```typescript
async updateStudentLevel(studentId: string, level: number) {
  return supabase
    .from('students')
    .update({ current_level: level })
    .eq('id', studentId);
}
```

---

## Modified Service Methods

### GS-004: Get Leaderboard (Modified)

**Change**: Remove `levels` table join. Use `current_level` as plain integer.

```typescript
async getLeaderboard(classId: string, period: 'weekly' | 'all-time') {
  return supabase
    .from('students')
    .select('*, profiles!students_id_fkey!inner(full_name, avatar_url)')
    .eq('class_id', classId)
    .eq('is_active', true)
    .order('total_points', { ascending: false })
    .limit(10);
}
```

### Student Dashboard Service (Modified)

**Change**: Remove `levels` join and `student_achievements` query. Add rubʿ certifications count.

```typescript
async getDashboard(studentId: string) {
  const [studentResult, certCountResult, /* ...other existing queries */] = await Promise.all([
    supabase
      .from('students')
      .select('*')  // No levels join
      .eq('id', studentId)
      .single(),

    // Active certification count (= level)
    supabase
      .from('student_rub_certifications')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', studentId)
      .is('dormant_since', null),

    // Remove: achievementsResult query
    // Keep: homework, attendance, sessions, stickers queries
  ]);
}
```

---

## Removed Service Methods

| Method | ID | Reason |
|--------|----|--------|
| `getStudentTrophies()` | GS-005 | Trophies removed |
| `getStudentAchievements()` | GS-006 | Achievements removed |
| `getLevels()` | GS-007 | Old level system removed |

---

## RPC Functions (New)

### `increment_review_count`

Atomically increments `review_count` and updates `last_reviewed_at` for a "Good" revision.

```sql
CREATE OR REPLACE FUNCTION increment_review_count(cert_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE student_rub_certifications
  SET review_count = review_count + 1,
      last_reviewed_at = now(),
      dormant_since = NULL,
      updated_at = now()
  WHERE id = cert_id;
END;
$$;
```

---

## Query Key Conventions

Following existing `[feature, ...params]` pattern:

| Query Key | Description |
|-----------|-------------|
| `['rub-reference']` | Static 240-row reference (infinite staleTime) |
| `['rub-certifications', studentId]` | All certifications for a student |
| `['student-dashboard', studentId]` | Dashboard data (modified, no achievements) |
| `['leaderboard', classId, period]` | Leaderboard (modified, no levels join) |

**Invalidation on mutations**:
- `certifyRub` / `undoCertification` → invalidate `['rub-certifications', studentId]` + `['student-dashboard', studentId]`
- `recordGoodRevision` / `recordPoorRevision` / `recertifyRub` → invalidate `['rub-certifications', studentId]`
- `markDormant` / `updateStudentLevel` → invalidate `['rub-certifications', studentId]` + `['student-dashboard', studentId]`
