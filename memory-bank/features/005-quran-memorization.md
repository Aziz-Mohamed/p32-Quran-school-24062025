# 005 — Quran Memorization Tracking & Revision System

**Status:** Draft
**Priority:** P0
**Dependencies:** 001-mvp-phase1 (sessions, students, classes, profiles tables)
**Migration:** `00009_quran_memorization.sql`

---

## 1. Overview

A complete Quran memorization tracking system based on the proven three-part methodology used in Arabic Quran schools:

| Arabic Term | Transliteration | English | Description |
|-------------|-----------------|---------|-------------|
| **الحفظ الجديد** | Al-Hifz Al-Jadid | New Memorization | New verses the student is memorizing today |
| **المراجعة القريبة** | Al-Muraja'ah Al-Qareebah | Recent Review | Review of recently memorized content (last ~7 days) |
| **المراجعة البعيدة** | Al-Muraja'ah Al-Ba'eedah | Distant Review | Older memorized content, cycled through periodically |

The system uses a **modified SM-2 spaced repetition algorithm** to calculate optimal review intervals, ensuring students retain what they have memorized while steadily adding new content.

### 1.1 Goals

- Give teachers a structured way to record and evaluate recitation attempts (new memorization, recent review, distant review)
- Automatically compute optimal revision schedules using SM-2
- Provide students with a clear view of their memorization progress (which surahs/ayahs they know, what needs review)
- Allow teachers to assign specific memorization and revision tasks
- Allow advanced students to self-assign (teacher-enabled per student)
- Give parents and admins visibility into memorization progress

### 1.2 Non-Goals

- This system does **not** contain the Quran text itself (the app is a companion tool, per PRD 1.1)
- No audio recording or playback of recitations (Phase 3 per PRD)
- No AI-based tajweed detection or automated grading
- No offline-first sync (future enhancement)

---

## 2. Terminology

This spec uses **Arabic terminology** throughout, matching the language used in Arabic Quran schools. Translations are provided for clarity but the Arabic terms are canonical.

| Term | Arabic | Usage |
|------|--------|-------|
| New Memorization | الحفظ الجديد | Recitation type for brand-new verses |
| Recent Review | المراجعة القريبة | Recitation type for recently memorized (within 7 days) |
| Distant Review | المراجعة البعيدة | Recitation type for older memorized content |
| Surah | سورة | Chapter of the Quran (114 total) |
| Ayah (pl. Ayat) | آية (آيات) | Verse of the Quran |
| Juz (pl. Ajza) | جزء (أجزاء) | One of 30 equal divisions of the Quran |
| Hifz | حفظ | Memorization |
| Muraja'ah | مراجعة | Review/Revision |
| Tajweed | تجويد | Rules of Quran recitation pronunciation |
| Ease Factor | معامل السهولة | SM-2 parameter controlling interval growth rate |

---

## 3. Database Schema

### 3.1 New Tables

Three new tables plus one ALTER to the existing `students` table.

#### 3.1.1 `recitations` — Individual Recitation Attempts

Each row represents one recitation attempt by a student during a session. A session can have multiple recitations (e.g., new memorization of Surah Al-Baqarah 2:10-12 plus recent review of Al-Baqarah 2:1-5 plus distant review of Al-Fatiha).

```sql
CREATE TABLE recitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Quran reference
  surah_number INTEGER NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
  ayah_from INTEGER NOT NULL CHECK (ayah_from >= 1),
  ayah_to INTEGER NOT NULL CHECK (ayah_to >= 1),
  CONSTRAINT recitations_valid_ayah_range CHECK (ayah_to >= ayah_from),

  -- Recitation classification
  recitation_type TEXT NOT NULL CHECK (
    recitation_type IN ('new_memorization', 'recent_review', 'distant_review')
  ),
  -- Maps to: الحفظ الجديد | المراجعة القريبة | المراجعة البعيدة

  -- Evaluation scores (each 1-5)
  accuracy_score INTEGER NOT NULL CHECK (accuracy_score BETWEEN 1 AND 5),
    -- 1=many errors, 2=several errors, 3=some errors, 4=minor errors, 5=perfect
  fluency_score INTEGER NOT NULL CHECK (fluency_score BETWEEN 1 AND 5),
    -- 1=very hesitant, 2=frequent pauses, 3=occasional pauses, 4=mostly smooth, 5=flowing
  tajweed_score INTEGER NOT NULL CHECK (tajweed_score BETWEEN 1 AND 5),
    -- 1=poor, 2=below average, 3=acceptable, 4=good, 5=excellent

  -- Computed quality grade (0.0-5.0, weighted composite)
  quality_grade NUMERIC(3,2) NOT NULL CHECK (quality_grade BETWEEN 0 AND 5),

  -- Teacher notes for this specific recitation
  notes TEXT,

  -- Timestamps
  recited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Indexes:**
```sql
CREATE INDEX idx_recitations_school ON recitations(school_id);
CREATE INDEX idx_recitations_session ON recitations(session_id);
CREATE INDEX idx_recitations_student ON recitations(student_id);
CREATE INDEX idx_recitations_teacher ON recitations(teacher_id);
CREATE INDEX idx_recitations_student_surah ON recitations(student_id, surah_number);
CREATE INDEX idx_recitations_type ON recitations(recitation_type);
CREATE INDEX idx_recitations_recited_at ON recitations(recited_at);
```

#### 3.1.2 `memorization_progress` — Student Cumulative Knowledge Map

One row per student per ayah range (surah segment). Tracks SM-2 spaced repetition state for each memorized segment. This is the student's "knowledge map" of the Quran.

```sql
CREATE TABLE memorization_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,

  -- Quran reference (the memorized segment)
  surah_number INTEGER NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
  ayah_from INTEGER NOT NULL CHECK (ayah_from >= 1),
  ayah_to INTEGER NOT NULL CHECK (ayah_to >= 1),
  CONSTRAINT progress_valid_ayah_range CHECK (ayah_to >= ayah_from),

  -- Status
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (
    status IN ('not_started', 'in_progress', 'memorized', 'needs_review')
  ),

  -- SM-2 fields
  ease_factor NUMERIC(4,2) NOT NULL DEFAULT 2.50 CHECK (ease_factor >= 1.30),
    -- SM-2 ease factor, minimum 1.3, starts at 2.5
  interval_days INTEGER NOT NULL DEFAULT 0 CHECK (interval_days >= 0),
    -- Current review interval in days
  repetition_count INTEGER NOT NULL DEFAULT 0 CHECK (repetition_count >= 0),
    -- Number of successful consecutive reviews
  next_review_date DATE,
    -- When this segment should next be reviewed (NULL = not yet scheduled)
  last_reviewed_at TIMESTAMPTZ,
    -- When the student last recited this segment

  -- Classification helper
  first_memorized_at TIMESTAMPTZ,
    -- When the student first achieved 'memorized' status
    -- Used to classify: if within 7 days of now → recent_review, else → distant_review

  -- Aggregate stats for this segment
  total_recitations INTEGER NOT NULL DEFAULT 0 CHECK (total_recitations >= 0),
  average_quality NUMERIC(3,2) DEFAULT NULL CHECK (average_quality IS NULL OR average_quality BETWEEN 0 AND 5),
  last_quality_grade NUMERIC(3,2) DEFAULT NULL CHECK (last_quality_grade IS NULL OR last_quality_grade BETWEEN 0 AND 5),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One progress row per student per ayah range
  UNIQUE(student_id, surah_number, ayah_from, ayah_to)
);
```

**Indexes:**
```sql
CREATE INDEX idx_memo_progress_school ON memorization_progress(school_id);
CREATE INDEX idx_memo_progress_student ON memorization_progress(student_id);
CREATE INDEX idx_memo_progress_student_surah ON memorization_progress(student_id, surah_number);
CREATE INDEX idx_memo_progress_status ON memorization_progress(status);
CREATE INDEX idx_memo_progress_next_review ON memorization_progress(student_id, next_review_date)
  WHERE next_review_date IS NOT NULL;
CREATE INDEX idx_memo_progress_first_memorized ON memorization_progress(first_memorized_at)
  WHERE first_memorized_at IS NOT NULL;
```

**Trigger:**
```sql
CREATE TRIGGER set_memorization_progress_updated_at
  BEFORE UPDATE ON memorization_progress
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
```

#### 3.1.3 `memorization_assignments` — Teacher/Self-Assigned Tasks

Teachers (or students with self-assign permission) create assignments specifying what to memorize or review. Assignments link back to sessions when completed.

```sql
CREATE TABLE memorization_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    -- teacher_id or student_id (for self-assignment)

  -- Quran reference
  surah_number INTEGER NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
  ayah_from INTEGER NOT NULL CHECK (ayah_from >= 1),
  ayah_to INTEGER NOT NULL CHECK (ayah_to >= 1),
  CONSTRAINT assignments_valid_ayah_range CHECK (ayah_to >= ayah_from),

  -- Assignment classification
  assignment_type TEXT NOT NULL CHECK (
    assignment_type IN ('new_memorization', 'recent_review', 'distant_review')
  ),

  -- Scheduling
  due_date DATE NOT NULL,
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Completion
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'completed', 'overdue', 'cancelled')
  ),
  completed_at TIMESTAMPTZ,
  completion_recitation_id UUID REFERENCES recitations(id) ON DELETE SET NULL,
    -- Links to the recitation that fulfilled this assignment

  -- Notes
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Indexes:**
```sql
CREATE INDEX idx_memo_assignments_school ON memorization_assignments(school_id);
CREATE INDEX idx_memo_assignments_student ON memorization_assignments(student_id);
CREATE INDEX idx_memo_assignments_assigned_by ON memorization_assignments(assigned_by);
CREATE INDEX idx_memo_assignments_status ON memorization_assignments(status);
CREATE INDEX idx_memo_assignments_due_date ON memorization_assignments(student_id, due_date)
  WHERE status = 'pending';
CREATE INDEX idx_memo_assignments_type ON memorization_assignments(assignment_type);
```

**Trigger:**
```sql
CREATE TRIGGER set_memorization_assignments_updated_at
  BEFORE UPDATE ON memorization_assignments
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
```

### 3.2 ALTER Existing Tables

#### 3.2.1 `students` — Add Self-Assignment Permission

```sql
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS can_self_assign BOOLEAN NOT NULL DEFAULT false;
```

Teachers or admins toggle this per student. When `true`, the student can create their own `memorization_assignments` (the student tab shows an "Assign to Myself" action).

### 3.3 Row Level Security

All three new tables follow the project's existing RLS patterns with `get_user_school_id()` and `get_user_role()`.

#### 3.3.1 `recitations` RLS

```sql
ALTER TABLE recitations ENABLE ROW LEVEL SECURITY;

-- Admin: full access within school
CREATE POLICY "Admin can read all school recitations"
  ON recitations FOR SELECT
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Admin can insert recitations"
  ON recitations FOR INSERT
  WITH CHECK (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Admin can update recitations"
  ON recitations FOR UPDATE
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Admin can delete recitations"
  ON recitations FOR DELETE
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

-- Teacher: read school, insert/update own
CREATE POLICY "Teacher can read school recitations"
  ON recitations FOR SELECT
  USING (school_id = get_user_school_id() AND get_user_role() = 'teacher');

CREATE POLICY "Teacher can insert own recitations"
  ON recitations FOR INSERT
  WITH CHECK (
    school_id = get_user_school_id()
    AND teacher_id = auth.uid()
    AND get_user_role() = 'teacher'
  );

CREATE POLICY "Teacher can update own recitations"
  ON recitations FOR UPDATE
  USING (
    school_id = get_user_school_id()
    AND teacher_id = auth.uid()
    AND get_user_role() = 'teacher'
  );

-- Student: read own
CREATE POLICY "Student can read own recitations"
  ON recitations FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND student_id = auth.uid()
    AND get_user_role() = 'student'
  );

-- Parent: read children's
CREATE POLICY "Parent can read children recitations"
  ON recitations FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND get_user_role() = 'parent'
    AND student_id IN (SELECT id FROM students WHERE parent_id = auth.uid())
  );
```

#### 3.3.2 `memorization_progress` RLS

```sql
ALTER TABLE memorization_progress ENABLE ROW LEVEL SECURITY;

-- Admin: full access within school
CREATE POLICY "Admin can read all school memorization progress"
  ON memorization_progress FOR SELECT
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Admin can insert memorization progress"
  ON memorization_progress FOR INSERT
  WITH CHECK (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Admin can update memorization progress"
  ON memorization_progress FOR UPDATE
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Admin can delete memorization progress"
  ON memorization_progress FOR DELETE
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

-- Teacher: read + write for class students
CREATE POLICY "Teacher can read class memorization progress"
  ON memorization_progress FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND get_user_role() = 'teacher'
    AND student_id IN (
      SELECT s.id FROM students s
      JOIN classes c ON s.class_id = c.id
      WHERE c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teacher can insert class memorization progress"
  ON memorization_progress FOR INSERT
  WITH CHECK (
    school_id = get_user_school_id()
    AND get_user_role() = 'teacher'
    AND student_id IN (
      SELECT s.id FROM students s
      JOIN classes c ON s.class_id = c.id
      WHERE c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teacher can update class memorization progress"
  ON memorization_progress FOR UPDATE
  USING (
    school_id = get_user_school_id()
    AND get_user_role() = 'teacher'
    AND student_id IN (
      SELECT s.id FROM students s
      JOIN classes c ON s.class_id = c.id
      WHERE c.teacher_id = auth.uid()
    )
  );

-- Student: read own
CREATE POLICY "Student can read own memorization progress"
  ON memorization_progress FOR SELECT
  USING (student_id = auth.uid() AND get_user_role() = 'student');

-- Parent: read children's
CREATE POLICY "Parent can read children memorization progress"
  ON memorization_progress FOR SELECT
  USING (
    get_user_role() = 'parent'
    AND student_id IN (SELECT id FROM students WHERE parent_id = auth.uid())
  );
```

#### 3.3.3 `memorization_assignments` RLS

```sql
ALTER TABLE memorization_assignments ENABLE ROW LEVEL SECURITY;

-- Admin: full access within school
CREATE POLICY "Admin can read all school memorization assignments"
  ON memorization_assignments FOR SELECT
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Admin can insert memorization assignments"
  ON memorization_assignments FOR INSERT
  WITH CHECK (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Admin can update memorization assignments"
  ON memorization_assignments FOR UPDATE
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Admin can delete memorization assignments"
  ON memorization_assignments FOR DELETE
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

-- Teacher: read school, insert/update for class students
CREATE POLICY "Teacher can read school memorization assignments"
  ON memorization_assignments FOR SELECT
  USING (school_id = get_user_school_id() AND get_user_role() = 'teacher');

CREATE POLICY "Teacher can insert class memorization assignments"
  ON memorization_assignments FOR INSERT
  WITH CHECK (
    school_id = get_user_school_id()
    AND get_user_role() = 'teacher'
    AND assigned_by = auth.uid()
    AND student_id IN (
      SELECT s.id FROM students s
      JOIN classes c ON s.class_id = c.id
      WHERE c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teacher can update class memorization assignments"
  ON memorization_assignments FOR UPDATE
  USING (
    school_id = get_user_school_id()
    AND get_user_role() = 'teacher'
    AND assigned_by = auth.uid()
  );

-- Student: read own, insert own (if can_self_assign)
CREATE POLICY "Student can read own memorization assignments"
  ON memorization_assignments FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND student_id = auth.uid()
    AND get_user_role() = 'student'
  );

CREATE POLICY "Student can self-assign memorization"
  ON memorization_assignments FOR INSERT
  WITH CHECK (
    school_id = get_user_school_id()
    AND get_user_role() = 'student'
    AND student_id = auth.uid()
    AND assigned_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM students WHERE id = auth.uid() AND can_self_assign = true
    )
  );

CREATE POLICY "Student can update own self-assignments"
  ON memorization_assignments FOR UPDATE
  USING (
    school_id = get_user_school_id()
    AND get_user_role() = 'student'
    AND student_id = auth.uid()
    AND assigned_by = auth.uid()
  );

-- Parent: read children's
CREATE POLICY "Parent can read children memorization assignments"
  ON memorization_assignments FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND get_user_role() = 'parent'
    AND student_id IN (SELECT id FROM students WHERE parent_id = auth.uid())
  );
```

### 3.4 Realtime

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE recitations;
ALTER PUBLICATION supabase_realtime ADD TABLE memorization_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE memorization_assignments;
```

---

## 4. Algorithm: Modified SM-2 Spaced Repetition

### 4.1 Quality Grade Calculation

The quality grade is a weighted composite of the three evaluation scores, producing a value between 1.0 and 5.0:

```
quality_grade = (accuracy_score * 0.50) + (fluency_score * 0.30) + (tajweed_score * 0.20)
```

**Weight rationale:**
- **Accuracy (50%):** Correct recitation of the actual words is the most critical factor
- **Fluency (30%):** Smooth delivery indicates solid memorization
- **Tajweed (20%):** Pronunciation rules are important but secondary to recall

### 4.2 SM-2 Algorithm (Modified)

After each recitation, the student's `memorization_progress` row for that ayah range is updated:

```typescript
interface SM2Input {
  qualityGrade: number;      // 1.0-5.0 (weighted composite)
  currentEaseFactor: number; // >= 1.3, default 2.5
  currentInterval: number;   // days
  repetitionCount: number;   // consecutive successful reviews
}

interface SM2Output {
  easeFactor: number;
  interval: number;          // days until next review
  repetitionCount: number;
  status: 'in_progress' | 'memorized' | 'needs_review';
}

function calculateSM2(input: SM2Input): SM2Output {
  const { qualityGrade, currentEaseFactor, currentInterval, repetitionCount } = input;

  // Map quality grade (1-5) to SM-2 quality (0-5)
  // Our 1-5 scale maps to SM-2's 0-5 scale: grade 1 -> q=0, grade 5 -> q=5
  const q = Math.max(0, ((qualityGrade - 1) / 4) * 5);

  // Grade < 3.0 on our scale (q < 2.5): Failed review
  if (qualityGrade < 3.0) {
    return {
      easeFactor: Math.max(1.3, currentEaseFactor - 0.2),
      interval: 1,           // Reset to 1 day
      repetitionCount: 0,    // Reset consecutive count
      status: 'needs_review',
    };
  }

  // Grade >= 3.0: Successful review
  // Update ease factor using SM-2 formula
  const newEaseFactor = Math.max(
    1.3,
    currentEaseFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  );

  // Calculate new interval
  let newInterval: number;
  const newRepCount = repetitionCount + 1;

  if (newRepCount === 1) {
    newInterval = 1;         // First successful: review tomorrow
  } else if (newRepCount === 2) {
    newInterval = 3;         // Second successful: review in 3 days
  } else {
    newInterval = Math.round(currentInterval * newEaseFactor);
  }

  // Cap maximum interval at 180 days (6 months)
  newInterval = Math.min(newInterval, 180);

  return {
    easeFactor: Number(newEaseFactor.toFixed(2)),
    interval: newInterval,
    repetitionCount: newRepCount,
    status: 'memorized',
  };
}
```

### 4.3 Recitation Type Classification

When determining which type a recitation belongs to (for display and assignment purposes):

```typescript
type RecitationType = 'new_memorization' | 'recent_review' | 'distant_review';

function classifyRecitationType(
  firstMemorizedAt: Date | null,
  now: Date = new Date()
): RecitationType {
  if (!firstMemorizedAt) {
    return 'new_memorization';
  }

  const daysSinceMemorized = Math.floor(
    (now.getTime() - firstMemorizedAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceMemorized <= 7) {
    return 'recent_review';    // المراجعة القريبة
  }

  return 'distant_review';      // المراجعة البعيدة
}
```

### 4.4 Revision Schedule Generation

The revision scheduler determines what a student should review on any given day:

```typescript
interface RevisionScheduleItem {
  surahNumber: number;
  ayahFrom: number;
  ayahTo: number;
  type: RecitationType;
  priority: 'overdue' | 'due_today' | 'upcoming';
  daysSinceLastReview: number;
  progressId: string;
}

function generateDailySchedule(
  allProgress: MemorizationProgress[],
  today: Date
): {
  newMemorization: RevisionScheduleItem[];   // الحفظ الجديد
  recentReview: RevisionScheduleItem[];      // المراجعة القريبة
  distantReview: RevisionScheduleItem[];     // المراجعة البعيدة
} {
  // 1. Items with status='in_progress' or 'not_started' with pending assignment → new_memorization
  // 2. Items memorized within last 7 days AND next_review_date <= today → recent_review
  // 3. Items memorized > 7 days ago AND next_review_date <= today → distant_review
  // 4. Sort each category: overdue first, then by next_review_date ascending
  // ...
}
```

---

## 5. Static Quran Reference Data

The app needs a client-side reference of Quran structure (surah names, ayah counts, juz boundaries) for the `SurahAyahPicker` component and validation. This is **static data bundled with the app** (not stored in the database).

### 5.1 Surah Reference

```typescript
// src/features/memorization/utils/quran-reference.ts

interface SurahInfo {
  number: number;          // 1-114
  nameArabic: string;      // e.g., "الفاتحة"
  nameEnglish: string;     // e.g., "Al-Fatiha"
  totalAyahs: number;      // e.g., 7
  revelationType: 'meccan' | 'medinan';
  juzStart: number;        // Which juz this surah starts in (1-30)
}

const QURAN_SURAHS: SurahInfo[] = [
  { number: 1,   nameArabic: 'الفاتحة',    nameEnglish: 'Al-Fatiha',     totalAyahs: 7,   revelationType: 'meccan',  juzStart: 1  },
  { number: 2,   nameArabic: 'البقرة',      nameEnglish: 'Al-Baqarah',    totalAyahs: 286, revelationType: 'medinan', juzStart: 1  },
  { number: 3,   nameArabic: 'آل عمران',    nameEnglish: 'Aal-Imran',     totalAyahs: 200, revelationType: 'medinan', juzStart: 3  },
  // ... all 114 surahs
  { number: 114, nameArabic: 'الناس',       nameEnglish: 'An-Nas',        totalAyahs: 6,   revelationType: 'meccan',  juzStart: 30 },
];
```

### 5.2 Juz Boundaries

```typescript
interface JuzBoundary {
  juzNumber: number;       // 1-30
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
}

const QURAN_JUZ_BOUNDARIES: JuzBoundary[] = [
  { juzNumber: 1,  startSurah: 1,  startAyah: 1,   endSurah: 2,   endAyah: 141 },
  { juzNumber: 2,  startSurah: 2,  startAyah: 142,  endSurah: 2,   endAyah: 252 },
  // ... all 30 juz
  { juzNumber: 30, startSurah: 78, startAyah: 1,   endSurah: 114, endAyah: 6   },
];
```

### 5.3 Utility Functions

```typescript
/** Get total ayah count for a surah */
function getSurahAyahCount(surahNumber: number): number;

/** Validate an ayah range for a given surah */
function isValidAyahRange(surahNumber: number, ayahFrom: number, ayahTo: number): boolean;

/** Get which juz an ayah belongs to */
function getJuzForAyah(surahNumber: number, ayahNumber: number): number;

/** Get the surah name in the current locale */
function getSurahName(surahNumber: number, locale: 'ar' | 'en'): string;

/** Calculate total ayahs in a range (possibly spanning surahs, for future use) */
function calculateAyahCount(surahNumber: number, ayahFrom: number, ayahTo: number): number;

/** Get all surahs that belong to a specific juz */
function getSurahsInJuz(juzNumber: number): SurahInfo[];
```

---

## 6. Phase 1: Schema + Recitation Recording

**Goal:** Establish the database foundation, build the SM-2 algorithm, and integrate recitation recording into the existing teacher session flow.

### 6.1 Migration

File: `supabase/migrations/00009_quran_memorization.sql`

Contains:
1. `ALTER students ADD COLUMN can_self_assign`
2. `CREATE TABLE recitations` with indexes
3. `CREATE TABLE memorization_progress` with indexes and trigger
4. `CREATE TABLE memorization_assignments` with indexes and trigger
5. RLS policies for all three tables
6. Realtime publication for all three tables

### 6.2 Feature Module Structure

```
src/features/memorization/
  index.ts                              # Barrel export
  types/
    memorization.types.ts               # All TypeScript interfaces
  services/
    recitation.service.ts               # CRUD for recitations table
    memorization-progress.service.ts    # CRUD + SM-2 update logic for progress
    assignment.service.ts               # CRUD for assignments
    revision-schedule.service.ts        # Daily schedule computation
  hooks/
    useRecitations.ts                   # Query recitations by session/student
    useCreateRecitation.ts              # Mutation: create recitation + update progress
    useMemorizationProgress.ts          # Query student's knowledge map
    useAssignments.ts                   # Query/create/update assignments
    useRevisionSchedule.ts             # Computed daily revision schedule
    useMemorizationStats.ts            # Aggregate stats (total memorized, etc.)
  utils/
    spaced-repetition.ts               # SM-2 algorithm implementation
    quran-reference.ts                 # Static Quran data (surahs, juz)
    validation.ts                      # Ayah range validation helpers
  components/
    SurahAyahPicker.tsx                # Surah dropdown + ayah from/to inputs
    RecitationTypeChip.tsx             # Colored chip: الحفظ الجديد / المراجعة القريبة / المراجعة البعيدة
    RecitationForm.tsx                 # Full recitation entry form (used in session)
    RecitationScoreSliders.tsx         # Accuracy / Fluency / Tajweed sliders
    RevisionCard.tsx                   # Card showing a revision item with due date
    MemorizationProgressBar.tsx        # Visual progress bar (juz/surah level)
    QuranProgressGrid.tsx              # Grid view of all 114 surahs with color-coded status
```

### 6.3 TypeScript Types

```typescript
// src/features/memorization/types/memorization.types.ts

import type { Tables } from '@/types/database.types';

// ─── Database Row Types ─────────────────────────────────────────────────────

export type Recitation = Tables<'recitations'>;
export type MemorizationProgress = Tables<'memorization_progress'>;
export type MemorizationAssignment = Tables<'memorization_assignments'>;

// ─── Enums ──────────────────────────────────────────────────────────────────

export type RecitationType = 'new_memorization' | 'recent_review' | 'distant_review';
export type ProgressStatus = 'not_started' | 'in_progress' | 'memorized' | 'needs_review';
export type AssignmentStatus = 'pending' | 'completed' | 'overdue' | 'cancelled';

// ─── Input Types ────────────────────────────────────────────────────────────

export interface CreateRecitationInput {
  session_id: string;
  student_id: string;
  teacher_id: string;
  surah_number: number;
  ayah_from: number;
  ayah_to: number;
  recitation_type: RecitationType;
  accuracy_score: number;  // 1-5
  fluency_score: number;   // 1-5
  tajweed_score: number;   // 1-5
  notes?: string | null;
}

export interface CreateAssignmentInput {
  student_id: string;
  assigned_by: string;
  surah_number: number;
  ayah_from: number;
  ayah_to: number;
  assignment_type: RecitationType;
  due_date: string;        // ISO date string
  notes?: string | null;
}

// ─── Query/Filter Types ─────────────────────────────────────────────────────

export interface RecitationFilters {
  studentId?: string;
  sessionId?: string;
  surahNumber?: number;
  recitationType?: RecitationType;
  dateFrom?: string;
  dateTo?: string;
}

export interface ProgressFilters {
  studentId: string;
  surahNumber?: number;
  status?: ProgressStatus;
}

export interface AssignmentFilters {
  studentId?: string;
  assignedBy?: string;
  status?: AssignmentStatus;
  dueDateFrom?: string;
  dueDateTo?: string;
}

// ─── Computed Types ─────────────────────────────────────────────────────────

export interface RevisionScheduleItem {
  progressId: string;
  surahNumber: number;
  ayahFrom: number;
  ayahTo: number;
  type: RecitationType;
  priority: 'overdue' | 'due_today' | 'upcoming';
  daysOverdue: number;           // 0 if due_today or upcoming, positive if overdue
  nextReviewDate: string | null;
  lastReviewedAt: string | null;
  easeFactor: number;
  lastQualityGrade: number | null;
}

export interface DailyRevisionSchedule {
  newMemorization: RevisionScheduleItem[];    // الحفظ الجديد
  recentReview: RevisionScheduleItem[];       // المراجعة القريبة
  distantReview: RevisionScheduleItem[];      // المراجعة البعيدة
  totalItems: number;
  overdueCount: number;
}

export interface MemorizationStats {
  totalAyahsMemorized: number;
  totalAyahsInProgress: number;
  totalAyahsNeedReview: number;
  totalSurahsCompleted: number;  // Surahs where all ayahs are memorized
  totalJuzCompleted: number;     // Juz where all ayahs are memorized
  totalRecitations: number;
  averageQualityGrade: number;
  currentStreak: number;         // Consecutive days with at least one recitation
  overdueReviewCount: number;
}

// ─── SM-2 Types ─────────────────────────────────────────────────────────────

export interface SM2Input {
  qualityGrade: number;
  currentEaseFactor: number;
  currentInterval: number;
  repetitionCount: number;
}

export interface SM2Output {
  easeFactor: number;
  interval: number;
  repetitionCount: number;
  status: ProgressStatus;
  nextReviewDate: string;        // ISO date string
}
```

### 6.4 Teacher Session Form Modification

The existing session creation flow (`app/(teacher)/sessions/create.tsx`) is enhanced to include recitation recording:

**Current flow:**
1. Select student
2. Set scores (recitation_quality, tajweed_score, memorization_score)
3. Add notes
4. Save session

**New flow (Phase 1):**
1. Select student
2. Set general session scores (existing fields remain for backward compatibility)
3. **Add recitations** (repeatable section):
   - For each recitation:
     a. Select surah + ayah range (SurahAyahPicker)
     b. Choose recitation type (auto-suggested based on student's progress, manually overridable)
     c. Score: accuracy (1-5), fluency (1-5), tajweed (1-5)
     d. Optional notes
   - "Add another recitation" button
4. Add general session notes
5. Save session (creates `sessions` row + all `recitations` rows + updates `memorization_progress`)

**Auto-suggestion logic:** When the teacher selects a surah/ayah range, the system checks the student's `memorization_progress`:
- No existing progress row for that range -> suggest "الحفظ الجديد" (new memorization)
- Progress exists with `first_memorized_at` within 7 days -> suggest "المراجعة القريبة" (recent review)
- Progress exists with `first_memorized_at` older than 7 days -> suggest "المراجعة البعيدة" (distant review)

### 6.5 Session Detail View Modification

The session detail screen (`app/(teacher)/sessions/[id].tsx` and student equivalent) is enhanced to show:

- Existing session fields (scores, notes, homework)
- **Recitations list** for this session:
  - Each recitation shows: surah name + ayah range, type chip, three score bars, quality grade, notes
  - Color-coded by type: green (new memorization), blue (recent review), purple (distant review)

### 6.6 Recitation Creation Flow (Detailed)

When a teacher saves a session with recitations, the following happens transactionally:

```
1. INSERT INTO sessions (...)        → session_id
2. For each recitation:
   a. Compute quality_grade = (accuracy * 0.5) + (fluency * 0.3) + (tajweed * 0.2)
   b. INSERT INTO recitations (..., quality_grade)
   c. UPSERT memorization_progress:
      - If no row exists: INSERT with SM-2 defaults, set status based on quality
      - If row exists: Run SM-2 algorithm, update interval/ease_factor/next_review_date
      - If recitation_type = 'new_memorization' AND quality_grade >= 3.0:
        Set first_memorized_at = now() (only if currently NULL)
        Set status = 'memorized'
      - If quality_grade < 3.0:
        Set status = 'needs_review'
      - Update total_recitations, average_quality, last_quality_grade, last_reviewed_at
   d. If there's a pending assignment matching this surah/ayah range:
      Mark assignment as completed, link completion_recitation_id
3. Invalidate relevant TanStack Query caches
```

---

## 7. Phase 2: Revision Scheduler + Views

**Goal:** Build the student-facing memorization experience and teacher assignment management.

### 7.1 Student "Memorization" Tab

The existing student tab bar has a "Lessons" tab. In this feature, a new **"Memorization"** tab (حفظي) is added alongside it (not replacing it, as lessons serve a different purpose):

**Tab bar (student):**
| Tab | Label (EN) | Label (AR) | Icon |
|-----|-----------|-----------|------|
| Home | Dashboard | الرئيسية | home |
| Lessons | Lessons | الدروس | book |
| **Memorization** | **Memorization** | **حفظي** | book-open-variant |
| Stickers | Stickers | الملصقات | star |
| Profile | Profile | الملف | person |

Route: `app/(student)/(tabs)/memorization.tsx`

**Screen layout:**

```
┌─────────────────────────────────────┐
│  حفظي / My Memorization            │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Overall Progress             │   │
│  │ ████████░░░░ 42% (2,648 ayat)│  │
│  │ 12 surahs complete           │   │
│  │ 4 juz complete               │   │
│  └─────────────────────────────┘   │
│                                     │
│  Today's Schedule                   │
│  ─────────────────                  │
│                                     │
│  الحفظ الجديد (New Memorization)    │
│  ┌─────────────────────────────┐   │
│  │ البقرة 2:142-145            │   │
│  │ Due today · Assigned by      │   │
│  │ Teacher Ahmad                │   │
│  └─────────────────────────────┘   │
│                                     │
│  المراجعة القريبة (Recent Review)  │
│  ┌─────────────────────────────┐   │
│  │ البقرة 2:130-141            │   │
│  │ Memorized 3 days ago         │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ البقرة 2:120-129            │   │
│  │ Memorized 5 days ago         │   │
│  └─────────────────────────────┘   │
│                                     │
│  المراجعة البعيدة (Distant Review) │
│  ┌─────────────────────────────┐   │
│  │ الفاتحة 1:1-7 · Due today  │   │
│  │ Last reviewed 14 days ago    │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ البقرة 2:1-5 · 2 days overdue│  │
│  │ Last reviewed 12 days ago    │   │
│  └─────────────────────────────┘   │
│                                     │
│  [View All Progress →]              │
└─────────────────────────────────────┘
```

### 7.2 Student Memorization Progress Screen

Route: `app/(student)/memorization/progress.tsx`

A detailed view of the student's entire Quran knowledge map.

**Views available:**
1. **Surah View** — List of all 114 surahs with progress percentage for each
2. **Juz View** — 30 juz with progress percentage for each
3. **Grid View** — Color-coded grid of all surahs (quick visual overview)

**Surah list item:**
```
┌─────────────────────────────────────┐
│ 2. البقرة (Al-Baqarah)             │
│ ████████████░░░░░░░░ 60%           │
│ 172/286 ayahs memorized             │
│ 12 need review · 8 in progress      │
│ Last recited: 2 days ago            │
└─────────────────────────────────────┘
```

**Color coding:**
| Status | Color | Meaning |
|--------|-------|---------|
| `memorized` | Green (#10B981) | Solid memorization, review on schedule |
| `needs_review` | Amber (#F59E0B) | Overdue for review or failed last attempt |
| `in_progress` | Blue (#3B82F6) | Currently being memorized |
| `not_started` | Gray (#CBD5E1) | Not yet attempted |

### 7.3 Teacher Assignment Screen

Route: `app/(teacher)/memorization/assign.tsx`

Teachers create memorization assignments for students.

**Flow:**
1. Select student (from class roster)
2. Choose assignment type:
   - الحفظ الجديد — system suggests the next un-memorized ayah range based on student's progress
   - المراجعة القريبة — system shows recently memorized segments
   - المراجعة البعيدة — system shows overdue review items
3. Select/confirm surah + ayah range (SurahAyahPicker, pre-filled by suggestion)
4. Set due date (defaults to next session day)
5. Add optional notes
6. Save

**Bulk assignment:** Teachers can also assign the same memorization task to all students in a class at once.

### 7.4 Teacher Student Memorization View

Route: `app/(teacher)/students/[id]/memorization.tsx`

Teachers can view any class student's full memorization map:

- Overall stats (total memorized, completion percentage, average quality)
- Surah-by-surah progress list
- Recent recitations with scores
- Pending assignments
- Overdue reviews highlighted
- "Assign New" quick action button

### 7.5 Student Dashboard Enhancement

The student dashboard (`app/(student)/(tabs)/index.tsx`) gains a new card:

**Memorization Summary Card:**
```
┌─────────────────────────────────────┐
│  Today's Memorization               │
│                                     │
│  3 items to review today            │
│  1 overdue review                   │
│                                     │
│  الحفظ الجديد: البقرة 2:142-145    │
│                                     │
│  [Go to Memorization →]             │
└─────────────────────────────────────┘
```

### 7.6 Self-Assignment Flow (Student)

If `students.can_self_assign = true`, the student's Memorization tab shows an "Assign to Myself" FAB:

1. Student taps FAB
2. Selects assignment type
3. System auto-suggests based on:
   - **New memorization:** Next contiguous un-memorized range after their last memorized position
   - **Recent review:** Items memorized within 7 days that are due
   - **Distant review:** Oldest items that are due or overdue
4. Student confirms or adjusts the surah/ayah range
5. Sets due date
6. Saves assignment

### 7.7 Route Summary (Phase 2)

| Route | Role | Description |
|-------|------|-------------|
| `app/(student)/(tabs)/memorization.tsx` | Student | Memorization tab (daily schedule) |
| `app/(student)/memorization/progress.tsx` | Student | Full progress view (surah/juz/grid) |
| `app/(student)/memorization/assign.tsx` | Student | Self-assignment (if enabled) |
| `app/(teacher)/memorization/assign.tsx` | Teacher | Assign memorization to student(s) |
| `app/(teacher)/students/[id]/memorization.tsx` | Teacher | View student's memorization map |

---

## 8. Phase 3: Analytics + Parent/Admin Views

**Goal:** Provide memorization visibility to parents and admins, add analytics, and complete i18n.

### 8.1 Parent Memorization View

Route: `app/(parent)/children/[id]/memorization.tsx`

Parents see a read-only view of their child's memorization:

- Overall progress stats (total ayahs memorized, surahs completed, juz completed)
- Surah progress list (same view as student, but read-only)
- Recent recitation history with scores
- Upcoming/overdue assignments
- Trend indicators (improving/declining quality over time)

### 8.2 Admin Memorization Reports

Route: `app/(admin)/reports/memorization.tsx`

**School-wide memorization analytics:**

1. **Overview KPIs:**
   - Total students actively memorizing
   - Average ayahs memorized per student
   - Average quality grade across school
   - Students with overdue reviews (attention needed)

2. **Class Comparison:**
   - Bar chart: average memorization progress by class
   - Class ranking by completion percentage

3. **Student Leaderboard (Memorization):**
   - Top students by total ayahs memorized
   - Top students by average quality grade
   - Most consistent reviewers (fewest overdue items)

4. **Trend Charts:**
   - Line chart: new ayahs memorized per week (school-wide)
   - Line chart: average quality grade over time
   - Stacked area: distribution of recitation types over time

5. **At-Risk Students:**
   - Students with declining quality grades
   - Students with many overdue reviews
   - Students who haven't recited in X days

### 8.3 RPC Functions for Analytics

```sql
-- Get memorization summary stats for a student
CREATE OR REPLACE FUNCTION get_student_memorization_stats(
  p_student_id UUID
)
RETURNS TABLE (
  total_ayahs_memorized BIGINT,
  total_ayahs_in_progress BIGINT,
  total_ayahs_needs_review BIGINT,
  total_surahs_completed BIGINT,
  total_recitations BIGINT,
  average_quality NUMERIC,
  overdue_review_count BIGINT
)
LANGUAGE sql
SECURITY INVOKER
SET search_path = public;

-- Get school-wide memorization overview
CREATE OR REPLACE FUNCTION get_school_memorization_overview(
  p_school_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  active_students BIGINT,
  avg_ayahs_memorized NUMERIC,
  avg_quality_grade NUMERIC,
  total_recitations_period BIGINT,
  students_with_overdue BIGINT
)
LANGUAGE sql
SECURITY INVOKER
SET search_path = public;

-- Get class memorization comparison
CREATE OR REPLACE FUNCTION get_class_memorization_comparison(
  p_school_id UUID
)
RETURNS TABLE (
  class_id UUID,
  class_name TEXT,
  student_count BIGINT,
  avg_ayahs_memorized NUMERIC,
  avg_quality_grade NUMERIC,
  completion_percentage NUMERIC
)
LANGUAGE sql
SECURITY INVOKER
SET search_path = public;
```

### 8.4 i18n Strings

All user-facing strings go through i18next. Key additions:

```json
// en.json (additions)
{
  "memorization": {
    "title": "Memorization",
    "myMemorization": "My Memorization",
    "todaySchedule": "Today's Schedule",
    "newMemorization": "New Memorization",
    "recentReview": "Recent Review",
    "distantReview": "Distant Review",
    "newMemorizationAr": "الحفظ الجديد",
    "recentReviewAr": "المراجعة القريبة",
    "distantReviewAr": "المراجعة البعيدة",
    "overdue": "Overdue",
    "dueToday": "Due Today",
    "upcoming": "Upcoming",
    "surah": "Surah",
    "ayah": "Ayah",
    "ayahs": "Ayahs",
    "juz": "Juz",
    "from": "From",
    "to": "To",
    "progress": "Progress",
    "memorized": "Memorized",
    "needsReview": "Needs Review",
    "inProgress": "In Progress",
    "notStarted": "Not Started",
    "accuracy": "Accuracy",
    "fluency": "Fluency",
    "tajweed": "Tajweed",
    "qualityGrade": "Quality Grade",
    "addRecitation": "Add Recitation",
    "addAnother": "Add Another Recitation",
    "assignMemorization": "Assign Memorization",
    "assignToMyself": "Assign to Myself",
    "selfAssignEnabled": "Self-assignment enabled",
    "selfAssignDisabled": "Self-assignment disabled",
    "viewAllProgress": "View All Progress",
    "totalMemorized": "Total Memorized",
    "surahsCompleted": "Surahs Completed",
    "juzCompleted": "Juz Completed",
    "averageQuality": "Average Quality",
    "lastRecited": "Last Recited",
    "daysAgo": "{{count}} days ago",
    "nextReview": "Next Review",
    "noRecitations": "No recitations yet",
    "noAssignments": "No assignments",
    "overdueReviews": "Overdue Reviews",
    "atRiskStudents": "Students Needing Attention",
    "revisionSchedule": "Revision Schedule",
    "recitationType": "Recitation Type",
    "selectSurah": "Select Surah",
    "selectAyahRange": "Select Ayah Range",
    "suggestedType": "Suggested: {{type}}",
    "dueDate": "Due Date",
    "assignedBy": "Assigned by {{name}}",
    "completedOn": "Completed on {{date}}",
    "stats": {
      "schoolOverview": "School Memorization Overview",
      "classComparison": "Class Comparison",
      "topStudents": "Top Students",
      "trends": "Trends"
    }
  }
}
```

```json
// ar.json (additions)
{
  "memorization": {
    "title": "الحفظ",
    "myMemorization": "حفظي",
    "todaySchedule": "جدول اليوم",
    "newMemorization": "الحفظ الجديد",
    "recentReview": "المراجعة القريبة",
    "distantReview": "المراجعة البعيدة",
    "newMemorizationAr": "الحفظ الجديد",
    "recentReviewAr": "المراجعة القريبة",
    "distantReviewAr": "المراجعة البعيدة",
    "overdue": "متأخر",
    "dueToday": "مطلوب اليوم",
    "upcoming": "قادم",
    "surah": "سورة",
    "ayah": "آية",
    "ayahs": "آيات",
    "juz": "جزء",
    "from": "من",
    "to": "إلى",
    "progress": "التقدم",
    "memorized": "محفوظ",
    "needsReview": "يحتاج مراجعة",
    "inProgress": "قيد الحفظ",
    "notStarted": "لم يبدأ",
    "accuracy": "الدقة",
    "fluency": "الطلاقة",
    "tajweed": "التجويد",
    "qualityGrade": "درجة الجودة",
    "addRecitation": "إضافة تسميع",
    "addAnother": "إضافة تسميع آخر",
    "assignMemorization": "تعيين حفظ",
    "assignToMyself": "تعيين لنفسي",
    "selfAssignEnabled": "التعيين الذاتي مفعّل",
    "selfAssignDisabled": "التعيين الذاتي معطّل",
    "viewAllProgress": "عرض كل التقدم",
    "totalMemorized": "إجمالي المحفوظ",
    "surahsCompleted": "السور المكتملة",
    "juzCompleted": "الأجزاء المكتملة",
    "averageQuality": "متوسط الجودة",
    "lastRecited": "آخر تسميع",
    "daysAgo": "منذ {{count}} أيام",
    "nextReview": "المراجعة القادمة",
    "noRecitations": "لا يوجد تسميع بعد",
    "noAssignments": "لا يوجد تعيينات",
    "overdueReviews": "مراجعات متأخرة",
    "atRiskStudents": "طلاب يحتاجون اهتمام",
    "revisionSchedule": "جدول المراجعة",
    "recitationType": "نوع التسميع",
    "selectSurah": "اختر السورة",
    "selectAyahRange": "اختر نطاق الآيات",
    "suggestedType": "مقترح: {{type}}",
    "dueDate": "تاريخ الاستحقاق",
    "assignedBy": "تعيين بواسطة {{name}}",
    "completedOn": "أكمل في {{date}}",
    "stats": {
      "schoolOverview": "نظرة عامة على حفظ المدرسة",
      "classComparison": "مقارنة الفصول",
      "topStudents": "أفضل الطلاب",
      "trends": "الاتجاهات"
    }
  }
}
```

### 8.5 Route Summary (Phase 3)

| Route | Role | Description |
|-------|------|-------------|
| `app/(parent)/children/[id]/memorization.tsx` | Parent | Child's memorization view |
| `app/(admin)/reports/memorization.tsx` | Admin | School-wide memorization analytics |

---

## 9. Component Specifications

### 9.1 SurahAyahPicker

A compound picker for selecting a Quran reference (surah + ayah range).

**Props:**
```typescript
interface SurahAyahPickerProps {
  value: {
    surahNumber: number | null;
    ayahFrom: number | null;
    ayahTo: number | null;
  };
  onChange: (value: {
    surahNumber: number;
    ayahFrom: number;
    ayahTo: number;
  }) => void;
  /** If provided, pre-fills suggestions based on student's progress */
  studentId?: string;
  /** Disable editing (read-only display) */
  disabled?: boolean;
  /** Show validation errors */
  error?: string;
}
```

**Behavior:**
1. Surah dropdown (searchable, shows both Arabic + English names)
2. When surah is selected, ayah range inputs appear (from/to number inputs)
3. "To" defaults to surah's max ayah count
4. Validation: from <= to, both within surah's ayah count
5. Shows compact display: "البقرة ٢:١٤٢-١٤٥" or "Al-Baqarah 2:142-145"

### 9.2 RecitationTypeChip

A colored chip displaying the recitation type in Arabic.

**Props:**
```typescript
interface RecitationTypeChipProps {
  type: RecitationType;
  size?: 'sm' | 'md';
}
```

**Colors:**
| Type | Background | Text |
|------|-----------|------|
| `new_memorization` | `#E6F7F5` (primary.50) | `#0D9488` (primary.500) |
| `recent_review` | `#DBEAFE` (blue.100) | `#2563EB` (blue.600) |
| `distant_review` | `#EDE9FE` (violet.100) | `#7C3AED` (violet.600) |

### 9.3 RecitationForm

The form used within session creation for adding individual recitations.

**Props:**
```typescript
interface RecitationFormProps {
  studentId: string;
  sessionId?: string;  // null during creation, set on edit
  onSubmit: (data: CreateRecitationInput) => void;
  onCancel: () => void;
  /** Pre-fill from assignment */
  defaultValues?: Partial<CreateRecitationInput>;
}
```

**Layout:**
```
┌─────────────────────────────────────┐
│ Recitation                      [X] │
│                                     │
│ Surah: [  Al-Baqarah (البقرة)  ▼]  │
│ Ayah:  [ 142 ] to [ 145 ]         │
│                                     │
│ Type: [الحفظ الجديد] (suggested)   │
│       ○ الحفظ الجديد               │
│       ○ المراجعة القريبة            │
│       ○ المراجعة البعيدة            │
│                                     │
│ Accuracy:  ★ ★ ★ ★ ☆  (4/5)       │
│ Fluency:   ★ ★ ★ ☆ ☆  (3/5)       │
│ Tajweed:   ★ ★ ★ ★ ☆  (4/5)       │
│                                     │
│ Quality: 3.7 / 5.0                  │
│                                     │
│ Notes: [                     ]      │
│                                     │
│        [Cancel]  [Save Recitation]  │
└─────────────────────────────────────┘
```

### 9.4 RevisionCard

A card showing a single revision schedule item.

**Props:**
```typescript
interface RevisionCardProps {
  item: RevisionScheduleItem;
  onPress?: () => void;
}
```

**Layout:**
```
┌─────────────────────────────────────┐
│ [المراجعة القريبة]                  │
│ البقرة 2:130-141                    │
│ Memorized 5 days ago                │
│ Last quality: 4.2  ·  Due today    │
└─────────────────────────────────────┘
```

Overdue items show a red "X days overdue" badge.

### 9.5 MemorizationProgressBar

A visual progress bar that can represent surah-level or juz-level completion.

**Props:**
```typescript
interface MemorizationProgressBarProps {
  /** 0-100 percentage */
  percentage: number;
  /** Number of ayahs memorized / total */
  memorizedCount: number;
  totalCount: number;
  /** Show color segments for different statuses */
  segments?: {
    memorized: number;
    needsReview: number;
    inProgress: number;
    notStarted: number;
  };
  size?: 'sm' | 'md' | 'lg';
}
```

### 9.6 QuranProgressGrid

A compact grid showing all 114 surahs as small colored blocks, giving a bird's-eye view of memorization progress.

**Props:**
```typescript
interface QuranProgressGridProps {
  studentId: string;
  onSurahPress?: (surahNumber: number) => void;
}
```

Each surah is rendered as a small square colored by its dominant status (memorized=green, needs_review=amber, in_progress=blue, not_started=gray). Long-pressing shows a tooltip with surah name and percentage.

---

## 10. Data Flow

### 10.1 Recording a Recitation (Teacher)

```
Teacher taps "Add Recitation" in session form
  │
  ▼
RecitationForm opens
  │
  ▼
Teacher selects surah/ayah range
  │
  ▼
System auto-classifies recitation type
(checks memorization_progress for this student + range)
  │
  ▼
Teacher confirms type, enters scores (accuracy/fluency/tajweed)
  │
  ▼
Teacher saves session (with 1+ recitations)
  │
  ▼
useCreateRecitation mutation fires:
  1. Insert session row
  2. For each recitation:
     a. Compute quality_grade
     b. Insert recitation row
     c. Upsert memorization_progress (SM-2 update)
     d. Check/complete matching assignments
  3. Invalidate queries: ['recitations'], ['memorization-progress'], ['assignments']
  │
  ▼
UI updates: session detail shows recitations, student progress updates
```

### 10.2 Viewing Daily Schedule (Student)

```
Student opens Memorization tab
  │
  ▼
useRevisionSchedule hook fires:
  1. Fetch all memorization_progress for student
  2. Fetch pending assignments for student
  3. Client-side compute daily schedule:
     - Filter progress rows where next_review_date <= today
     - Classify each into recent/distant review
     - Add pending new_memorization assignments
     - Sort: overdue first, then by next_review_date
  4. Return DailyRevisionSchedule
  │
  ▼
UI renders three sections:
  - الحفظ الجديد (assignments + in_progress items)
  - المراجعة القريبة (recently memorized, due for review)
  - المراجعة البعيدة (older memorized, due for review)
```

### 10.3 Creating an Assignment (Teacher)

```
Teacher opens assignment screen
  │
  ▼
Selects student → system loads student's memorization_progress
  │
  ▼
Teacher selects assignment type:
  - If "new memorization": system suggests next un-memorized range
  - If "recent review": system shows recently memorized items due
  - If "distant review": system shows overdue distant items
  │
  ▼
Teacher confirms surah/ayah range, sets due date
  │
  ▼
useCreateAssignment mutation fires:
  1. Insert memorization_assignments row
  2. Invalidate queries: ['assignments']
  │
  ▼
Student sees assignment on their Memorization tab
```

---

## 11. Query Key Conventions

Following the project's `[feature, ...params]` pattern:

```typescript
// Recitations
['recitations', sessionId]                           // Recitations for a session
['recitations', 'student', studentId]                // All recitations for a student
['recitations', 'student', studentId, { filters }]   // Filtered

// Memorization Progress
['memorization-progress', studentId]                  // Full knowledge map
['memorization-progress', studentId, surahNumber]     // Single surah detail
['memorization-progress', 'stats', studentId]         // Aggregate stats

// Assignments
['assignments', studentId]                            // Student's assignments
['assignments', studentId, { status: 'pending' }]    // Filtered
['assignments', 'teacher', teacherId]                 // Assignments created by teacher

// Revision Schedule
['revision-schedule', studentId, dateStr]             // Daily schedule for a date

// Analytics (admin)
['memorization-analytics', schoolId, 'overview']
['memorization-analytics', schoolId, 'class-comparison']
['memorization-analytics', schoolId, 'trends', { dateRange }]
```

---

## 12. Edge Cases & Validation

### 12.1 Overlapping Ayah Ranges

When a teacher records a recitation for Surah 2, Ayahs 1-10, but the student already has progress rows for 2:1-5 and 2:6-10, the system should:
- Update **both** existing progress rows (not create a new overlapping one)
- Match recitation to existing progress rows by detecting overlap
- If the recitation range partially overlaps, update the overlapping portions

**Implementation:** The service layer uses range intersection logic when upserting progress.

### 12.2 Ayah Range Splitting/Merging

Teachers may record different-sized ranges over time. The system does **not** automatically merge or split `memorization_progress` rows. Rows are created as-is during the first recitation for a range. If a teacher later records a broader range that encompasses existing ranges, the existing rows are updated and no new row is created for the already-covered portions.

**Simplification for Phase 1:** Progress rows are matched exactly by (student_id, surah_number, ayah_from, ayah_to). If a recitation's range does not exactly match an existing progress row, a new row is created for that exact range. This avoids complex splitting logic. The SM-2 algorithm runs independently per progress row.

### 12.3 Concurrent Session Edits

If two teachers somehow record recitations for the same student at the same time, the `memorization_progress` UPSERT uses the latest recitation's SM-2 output. The `UNIQUE(student_id, surah_number, ayah_from, ayah_to)` constraint ensures data integrity.

### 12.4 Assignment Completion Detection

When a recitation is recorded, the system checks for pending assignments that match the same (student_id, surah_number, ayah_from, ayah_to, assignment_type). If found and quality_grade >= 3.0, the assignment is marked completed. If quality_grade < 3.0, the assignment remains pending (the student needs to retry).

### 12.5 Overdue Assignment Handling

A cron job or Edge Function (or client-side check) marks assignments as `overdue` when `due_date < CURRENT_DATE AND status = 'pending'`. Overdue assignments are surfaced prominently in the student's revision schedule.

---

## 13. Performance Considerations

| Area | Strategy |
|------|----------|
| Memorization progress queries | Indexed on `(student_id, surah_number)` and `(student_id, next_review_date)` |
| Daily schedule computation | Client-side filtering of pre-fetched progress (typically <500 rows per student) |
| Quran reference data | Static TypeScript constant, no DB round-trips |
| Recitation lists | Paginated via `useInfiniteQuery` for students with many recitations |
| Progress grid | FlashList with 114 items (lightweight, no pagination needed) |
| Analytics RPC | Server-side aggregation, cached with `staleTime: 5 * 60 * 1000` |
| SM-2 computation | Runs client-side in service layer (trivial compute cost) |

---

## 14. Migration Numbering & Dependency

| Migration | Depends On | Description |
|-----------|-----------|-------------|
| `00009_quran_memorization.sql` | `00001_initial_schema.sql` (students, sessions, profiles, schools, classes), `handle_updated_at()` function | Creates recitations, memorization_progress, memorization_assignments tables; alters students |

---

## 15. Phase Summary

| Phase | Deliverables | Roles Impacted |
|-------|-------------|----------------|
| **Phase 1** | DB migration, SM-2 algorithm, RecitationForm in session creation, session detail enhancement, static Quran reference, feature module scaffolding | Teacher |
| **Phase 2** | Student Memorization tab + progress screen, teacher assignment screen, teacher student memorization view, student dashboard card, self-assignment, revision scheduler | Student, Teacher |
| **Phase 3** | Parent memorization view, admin memorization reports, RPC analytics functions, full i18n (EN + AR) | Parent, Admin |

---

## 16. Open Questions

1. **Ayah range granularity:** Should the minimum assignable unit be a single ayah, or should we enforce a minimum of 3-5 ayahs per assignment to match typical school practice?
2. **Juz completion trophies:** Should completing a juz automatically award a gamification trophy? If so, this feature should trigger trophy awards (integration with existing gamification system).
3. **Audio recording integration:** Phase 3 of the PRD mentions audio recording for recitation. When that feature is built, recitations should gain an optional `audio_url` column. This spec does not include it but the schema is designed to accommodate it.
4. **Offline recitation recording:** If offline support (PRD Phase 2) is implemented, recitations recorded offline need to queue SM-2 updates and apply them when reconnected. This spec assumes online-only for now.
