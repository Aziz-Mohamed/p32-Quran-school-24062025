-- ============================================================================
-- Migration 00011: Gamification Redesign
-- Feature: 001-gamification-redesign
-- Date: 2026-02-21
--
-- Replaces old 5-concept gamification (points, levels, stickers, trophies,
-- achievements) with 2-concept model: rubʿ-based levels (0-240) + stickers.
-- ============================================================================

-- ============================================================================
-- SECTION 1: Drop Old System
-- Drop notification triggers first, then junction tables, then parent tables.
-- ============================================================================

-- 1a. Drop notification webhook triggers on junction tables
DROP TRIGGER IF EXISTS on_student_trophy_insert ON student_trophies;
DROP TRIGGER IF EXISTS on_student_achievement_insert ON student_achievements;

-- 1b. Drop junction tables first (they reference parent tables)
DROP TABLE IF EXISTS student_trophies CASCADE;
DROP TABLE IF EXISTS student_achievements CASCADE;

-- 1c. Drop parent tables
DROP TABLE IF EXISTS trophies CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS levels CASCADE;

-- ============================================================================
-- SECTION 2: Modify Existing Tables
-- ============================================================================

-- 2a. students.current_level — drop FK to levels, keep column as plain INTEGER
-- The FK was: REFERENCES levels(level_number) ON DELETE SET NULL
-- Now repurposed as cached count of active rubʿ certifications (0-240)
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_current_level_fkey;
ALTER TABLE students ALTER COLUMN current_level SET DEFAULT 0;
ALTER TABLE students ALTER COLUMN current_level SET NOT NULL;

-- 2b. Delete 10 trophy-tier stickers by ID (must happen BEFORE CHECK constraint change)
DELETE FROM student_stickers WHERE sticker_id IN (
  'memorization-excellence', 'perfect-tajweed', 'consistent-recitation',
  'best-effort', 'helping-others', 'streak-master', 'streak-7-days',
  'streak-30-days', 'complete-full-juz', 'top-of-leaderboard-for-week'
);
DELETE FROM stickers WHERE id IN (
  'memorization-excellence', 'perfect-tajweed', 'consistent-recitation',
  'best-effort', 'helping-others', 'streak-master', 'streak-7-days',
  'streak-30-days', 'complete-full-juz', 'top-of-leaderboard-for-week'
);

-- 2c. stickers — remove 'trophy' from tier CHECK constraint (after trophy rows deleted)
ALTER TABLE stickers DROP CONSTRAINT IF EXISTS stickers_tier_check;
ALTER TABLE stickers ADD CONSTRAINT stickers_tier_check
  CHECK (tier IN ('bronze', 'silver', 'gold', 'diamond', 'seasonal'));

-- ============================================================================
-- SECTION 3: Modify Existing Functions
-- Remove current_level update logic from handle_sticker_points().
-- Keep only total_points addition for leaderboard.
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_sticker_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sticker_points INTEGER;
BEGIN
  SELECT points_value INTO sticker_points FROM stickers WHERE id = NEW.sticker_id;

  UPDATE students
  SET total_points = total_points + COALESCE(sticker_points, 0)
  WHERE id = NEW.student_id;

  RETURN NEW;
END;
$$;

-- ============================================================================
-- SECTION 4: Create New Tables
-- ============================================================================

-- 4a. quran_rub_reference — static 240-row Quran structural reference
CREATE TABLE quran_rub_reference (
  rub_number INTEGER PRIMARY KEY CHECK (rub_number >= 1 AND rub_number <= 240),
  juz_number SMALLINT NOT NULL CHECK (juz_number >= 1 AND juz_number <= 30),
  hizb_number SMALLINT NOT NULL CHECK (hizb_number >= 1 AND hizb_number <= 60),
  quarter_in_hizb SMALLINT NOT NULL CHECK (quarter_in_hizb >= 1 AND quarter_in_hizb <= 4),
  start_surah SMALLINT NOT NULL CHECK (start_surah >= 1 AND start_surah <= 114),
  start_ayah SMALLINT NOT NULL CHECK (start_ayah >= 1),
  end_surah SMALLINT NOT NULL CHECK (end_surah >= 1 AND end_surah <= 114),
  end_ayah SMALLINT NOT NULL CHECK (end_ayah >= 1)
);

-- 4b. student_rub_certifications — per-student mastery tracking
CREATE TABLE student_rub_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  rub_number INTEGER NOT NULL REFERENCES quran_rub_reference(rub_number),
  certified_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  certified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  review_count INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  last_reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  dormant_since TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, rub_number)
);

-- Indexes per data-model.md
CREATE INDEX idx_rub_certifications_student
  ON student_rub_certifications(student_id);

CREATE INDEX idx_rub_certifications_student_active
  ON student_rub_certifications(student_id)
  WHERE dormant_since IS NULL;

CREATE INDEX idx_rub_certifications_dormant
  ON student_rub_certifications(student_id, dormant_since)
  WHERE dormant_since IS NOT NULL;

-- ============================================================================
-- SECTION 5: RLS Policies
-- ============================================================================

-- 5a. quran_rub_reference — public read, no writes (seeded by migration)
ALTER TABLE quran_rub_reference ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read rub reference"
  ON quran_rub_reference FOR SELECT
  USING (true);

-- 5b. student_rub_certifications — multi-role access
ALTER TABLE student_rub_certifications ENABLE ROW LEVEL SECURITY;

-- Teacher: SELECT class students
CREATE POLICY "Teacher can read class student certifications"
  ON student_rub_certifications FOR SELECT
  USING (
    get_user_role() = 'teacher'
    AND student_id IN (
      SELECT s.id FROM students s
      JOIN classes c ON s.class_id = c.id
      WHERE c.teacher_id = auth.uid()
    )
  );

-- Teacher: INSERT for class students
CREATE POLICY "Teacher can certify class students"
  ON student_rub_certifications FOR INSERT
  WITH CHECK (
    get_user_role() = 'teacher'
    AND certified_by = auth.uid()
    AND student_id IN (
      SELECT s.id FROM students s
      JOIN classes c ON s.class_id = c.id
      WHERE c.teacher_id = auth.uid()
    )
  );

-- Teacher: UPDATE class students
CREATE POLICY "Teacher can update class student certifications"
  ON student_rub_certifications FOR UPDATE
  USING (
    get_user_role() = 'teacher'
    AND student_id IN (
      SELECT s.id FROM students s
      JOIN classes c ON s.class_id = c.id
      WHERE c.teacher_id = auth.uid()
    )
  );

-- Teacher: DELETE class students (for undo within grace period)
CREATE POLICY "Teacher can delete class student certifications"
  ON student_rub_certifications FOR DELETE
  USING (
    get_user_role() = 'teacher'
    AND certified_by = auth.uid()
    AND student_id IN (
      SELECT s.id FROM students s
      JOIN classes c ON s.class_id = c.id
      WHERE c.teacher_id = auth.uid()
    )
  );

-- Admin: full access within school
CREATE POLICY "Admin can read school student certifications"
  ON student_rub_certifications FOR SELECT
  USING (
    get_user_role() = 'admin'
    AND student_id IN (
      SELECT id FROM students WHERE school_id = get_user_school_id()
    )
  );

CREATE POLICY "Admin can insert school student certifications"
  ON student_rub_certifications FOR INSERT
  WITH CHECK (
    get_user_role() = 'admin'
    AND student_id IN (
      SELECT id FROM students WHERE school_id = get_user_school_id()
    )
  );

CREATE POLICY "Admin can update school student certifications"
  ON student_rub_certifications FOR UPDATE
  USING (
    get_user_role() = 'admin'
    AND student_id IN (
      SELECT id FROM students WHERE school_id = get_user_school_id()
    )
  );

CREATE POLICY "Admin can delete school student certifications"
  ON student_rub_certifications FOR DELETE
  USING (
    get_user_role() = 'admin'
    AND student_id IN (
      SELECT id FROM students WHERE school_id = get_user_school_id()
    )
  );

-- Student: SELECT own records
CREATE POLICY "Student can read own certifications"
  ON student_rub_certifications FOR SELECT
  USING (
    get_user_role() = 'student'
    AND student_id = auth.uid()
  );

-- Parent: SELECT children's records
CREATE POLICY "Parent can read children certifications"
  ON student_rub_certifications FOR SELECT
  USING (
    get_user_role() = 'parent'
    AND student_id IN (
      SELECT id FROM students WHERE parent_id = auth.uid()
    )
  );

-- ============================================================================
-- SECTION 6: Functions & Triggers
-- ============================================================================

-- 6a. increment_review_count RPC — atomically increments review_count
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

-- 6b. updated_at trigger on student_rub_certifications
CREATE TRIGGER set_rub_certifications_updated_at
  BEFORE UPDATE ON student_rub_certifications
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================================================
-- SECTION 7: Seed Data — 240 Rubʿ Reference Rows
-- Source: alquran.cloud API /v1/meta (verified against Tarteel QUL)
-- ============================================================================

INSERT INTO quran_rub_reference (rub_number, juz_number, hizb_number, quarter_in_hizb, start_surah, start_ayah, end_surah, end_ayah) VALUES
  (1, 1, 1, 1, 1, 1, 2, 25),
  (2, 1, 1, 2, 2, 26, 2, 43),
  (3, 1, 1, 3, 2, 44, 2, 59),
  (4, 1, 1, 4, 2, 60, 2, 74),
  (5, 1, 2, 1, 2, 75, 2, 91),
  (6, 1, 2, 2, 2, 92, 2, 105),
  (7, 1, 2, 3, 2, 106, 2, 123),
  (8, 1, 2, 4, 2, 124, 2, 141),
  (9, 2, 3, 1, 2, 142, 2, 157),
  (10, 2, 3, 2, 2, 158, 2, 176),
  (11, 2, 3, 3, 2, 177, 2, 188),
  (12, 2, 3, 4, 2, 189, 2, 202),
  (13, 2, 4, 1, 2, 203, 2, 218),
  (14, 2, 4, 2, 2, 219, 2, 232),
  (15, 2, 4, 3, 2, 233, 2, 242),
  (16, 2, 4, 4, 2, 243, 2, 252),
  (17, 3, 5, 1, 2, 253, 2, 262),
  (18, 3, 5, 2, 2, 263, 2, 271),
  (19, 3, 5, 3, 2, 272, 2, 282),
  (20, 3, 5, 4, 2, 283, 3, 14),
  (21, 3, 6, 1, 3, 15, 3, 32),
  (22, 3, 6, 2, 3, 33, 3, 51),
  (23, 3, 6, 3, 3, 52, 3, 74),
  (24, 3, 6, 4, 3, 75, 3, 92),
  (25, 4, 7, 1, 3, 93, 3, 112),
  (26, 4, 7, 2, 3, 113, 3, 132),
  (27, 4, 7, 3, 3, 133, 3, 152),
  (28, 4, 7, 4, 3, 153, 3, 170),
  (29, 4, 8, 1, 3, 171, 3, 185),
  (30, 4, 8, 2, 3, 186, 3, 200),
  (31, 4, 8, 3, 4, 1, 4, 11),
  (32, 4, 8, 4, 4, 12, 4, 23),
  (33, 5, 9, 1, 4, 24, 4, 35),
  (34, 5, 9, 2, 4, 36, 4, 57),
  (35, 5, 9, 3, 4, 58, 4, 73),
  (36, 5, 9, 4, 4, 74, 4, 87),
  (37, 5, 10, 1, 4, 88, 4, 99),
  (38, 5, 10, 2, 4, 100, 4, 113),
  (39, 5, 10, 3, 4, 114, 4, 134),
  (40, 5, 10, 4, 4, 135, 4, 147),
  (41, 6, 11, 1, 4, 148, 4, 162),
  (42, 6, 11, 2, 4, 163, 4, 176),
  (43, 6, 11, 3, 5, 1, 5, 11),
  (44, 6, 11, 4, 5, 12, 5, 26),
  (45, 6, 12, 1, 5, 27, 5, 40),
  (46, 6, 12, 2, 5, 41, 5, 50),
  (47, 6, 12, 3, 5, 51, 5, 66),
  (48, 6, 12, 4, 5, 67, 5, 81),
  (49, 7, 13, 1, 5, 82, 5, 96),
  (50, 7, 13, 2, 5, 97, 5, 108),
  (51, 7, 13, 3, 5, 109, 6, 12),
  (52, 7, 13, 4, 6, 13, 6, 35),
  (53, 7, 14, 1, 6, 36, 6, 58),
  (54, 7, 14, 2, 6, 59, 6, 73),
  (55, 7, 14, 3, 6, 74, 6, 94),
  (56, 7, 14, 4, 6, 95, 6, 110),
  (57, 8, 15, 1, 6, 111, 6, 126),
  (58, 8, 15, 2, 6, 127, 6, 140),
  (59, 8, 15, 3, 6, 141, 6, 150),
  (60, 8, 15, 4, 6, 151, 6, 165),
  (61, 8, 16, 1, 7, 1, 7, 30),
  (62, 8, 16, 2, 7, 31, 7, 46),
  (63, 8, 16, 3, 7, 47, 7, 64),
  (64, 8, 16, 4, 7, 65, 7, 87),
  (65, 9, 17, 1, 7, 88, 7, 116),
  (66, 9, 17, 2, 7, 117, 7, 141),
  (67, 9, 17, 3, 7, 142, 7, 155),
  (68, 9, 17, 4, 7, 156, 7, 170),
  (69, 9, 18, 1, 7, 171, 7, 188),
  (70, 9, 18, 2, 7, 189, 7, 206),
  (71, 9, 18, 3, 8, 1, 8, 21),
  (72, 9, 18, 4, 8, 22, 8, 40),
  (73, 10, 19, 1, 8, 41, 8, 60),
  (74, 10, 19, 2, 8, 61, 8, 75),
  (75, 10, 19, 3, 9, 1, 9, 18),
  (76, 10, 19, 4, 9, 19, 9, 33),
  (77, 10, 20, 1, 9, 34, 9, 45),
  (78, 10, 20, 2, 9, 46, 9, 59),
  (79, 10, 20, 3, 9, 60, 9, 74),
  (80, 10, 20, 4, 9, 75, 9, 92),
  (81, 11, 21, 1, 9, 93, 9, 110),
  (82, 11, 21, 2, 9, 111, 9, 121),
  (83, 11, 21, 3, 9, 122, 10, 10),
  (84, 11, 21, 4, 10, 11, 10, 25),
  (85, 11, 22, 1, 10, 26, 10, 52),
  (86, 11, 22, 2, 10, 53, 10, 70),
  (87, 11, 22, 3, 10, 71, 10, 89),
  (88, 11, 22, 4, 10, 90, 11, 5),
  (89, 12, 23, 1, 11, 6, 11, 23),
  (90, 12, 23, 2, 11, 24, 11, 40),
  (91, 12, 23, 3, 11, 41, 11, 60),
  (92, 12, 23, 4, 11, 61, 11, 83),
  (93, 12, 24, 1, 11, 84, 11, 107),
  (94, 12, 24, 2, 11, 108, 12, 6),
  (95, 12, 24, 3, 12, 7, 12, 29),
  (96, 12, 24, 4, 12, 30, 12, 52),
  (97, 13, 25, 1, 12, 53, 12, 76),
  (98, 13, 25, 2, 12, 77, 12, 100),
  (99, 13, 25, 3, 12, 101, 13, 4),
  (100, 13, 25, 4, 13, 5, 13, 18),
  (101, 13, 26, 1, 13, 19, 13, 34),
  (102, 13, 26, 2, 13, 35, 14, 9),
  (103, 13, 26, 3, 14, 10, 14, 27),
  (104, 13, 26, 4, 14, 28, 14, 52),
  (105, 14, 27, 1, 15, 1, 15, 49),
  (106, 14, 27, 2, 15, 50, 15, 99),
  (107, 14, 27, 3, 16, 1, 16, 29),
  (108, 14, 27, 4, 16, 30, 16, 50),
  (109, 14, 28, 1, 16, 51, 16, 74),
  (110, 14, 28, 2, 16, 75, 16, 89),
  (111, 14, 28, 3, 16, 90, 16, 110),
  (112, 14, 28, 4, 16, 111, 16, 128),
  (113, 15, 29, 1, 17, 1, 17, 22),
  (114, 15, 29, 2, 17, 23, 17, 49),
  (115, 15, 29, 3, 17, 50, 17, 69),
  (116, 15, 29, 4, 17, 70, 17, 98),
  (117, 15, 30, 1, 17, 99, 18, 16),
  (118, 15, 30, 2, 18, 17, 18, 31),
  (119, 15, 30, 3, 18, 32, 18, 50),
  (120, 15, 30, 4, 18, 51, 18, 74),
  (121, 16, 31, 1, 18, 75, 18, 98),
  (122, 16, 31, 2, 18, 99, 19, 21),
  (123, 16, 31, 3, 19, 22, 19, 58),
  (124, 16, 31, 4, 19, 59, 19, 98),
  (125, 16, 32, 1, 20, 1, 20, 54),
  (126, 16, 32, 2, 20, 55, 20, 82),
  (127, 16, 32, 3, 20, 83, 20, 110),
  (128, 16, 32, 4, 20, 111, 20, 135),
  (129, 17, 33, 1, 21, 1, 21, 28),
  (130, 17, 33, 2, 21, 29, 21, 50),
  (131, 17, 33, 3, 21, 51, 21, 82),
  (132, 17, 33, 4, 21, 83, 21, 112),
  (133, 17, 34, 1, 22, 1, 22, 18),
  (134, 17, 34, 2, 22, 19, 22, 37),
  (135, 17, 34, 3, 22, 38, 22, 59),
  (136, 17, 34, 4, 22, 60, 22, 78),
  (137, 18, 35, 1, 23, 1, 23, 35),
  (138, 18, 35, 2, 23, 36, 23, 74),
  (139, 18, 35, 3, 23, 75, 23, 118),
  (140, 18, 35, 4, 24, 1, 24, 20),
  (141, 18, 36, 1, 24, 21, 24, 34),
  (142, 18, 36, 2, 24, 35, 24, 52),
  (143, 18, 36, 3, 24, 53, 24, 64),
  (144, 18, 36, 4, 25, 1, 25, 20),
  (145, 19, 37, 1, 25, 21, 25, 52),
  (146, 19, 37, 2, 25, 53, 25, 77),
  (147, 19, 37, 3, 26, 1, 26, 51),
  (148, 19, 37, 4, 26, 52, 26, 110),
  (149, 19, 38, 1, 26, 111, 26, 180),
  (150, 19, 38, 2, 26, 181, 26, 227),
  (151, 19, 38, 3, 27, 1, 27, 26),
  (152, 19, 38, 4, 27, 27, 27, 55),
  (153, 20, 39, 1, 27, 56, 27, 81),
  (154, 20, 39, 2, 27, 82, 28, 11),
  (155, 20, 39, 3, 28, 12, 28, 28),
  (156, 20, 39, 4, 28, 29, 28, 50),
  (157, 20, 40, 1, 28, 51, 28, 75),
  (158, 20, 40, 2, 28, 76, 28, 88),
  (159, 20, 40, 3, 29, 1, 29, 25),
  (160, 20, 40, 4, 29, 26, 29, 45),
  (161, 21, 41, 1, 29, 46, 29, 69),
  (162, 21, 41, 2, 30, 1, 30, 30),
  (163, 21, 41, 3, 30, 31, 30, 53),
  (164, 21, 41, 4, 30, 54, 31, 21),
  (165, 21, 42, 1, 31, 22, 32, 10),
  (166, 21, 42, 2, 32, 11, 32, 30),
  (167, 21, 42, 3, 33, 1, 33, 17),
  (168, 21, 42, 4, 33, 18, 33, 30),
  (169, 22, 43, 1, 33, 31, 33, 50),
  (170, 22, 43, 2, 33, 51, 33, 59),
  (171, 22, 43, 3, 33, 60, 34, 9),
  (172, 22, 43, 4, 34, 10, 34, 23),
  (173, 22, 44, 1, 34, 24, 34, 45),
  (174, 22, 44, 2, 34, 46, 35, 14),
  (175, 22, 44, 3, 35, 15, 35, 40),
  (176, 22, 44, 4, 35, 41, 36, 27),
  (177, 23, 45, 1, 36, 28, 36, 59),
  (178, 23, 45, 2, 36, 60, 37, 21),
  (179, 23, 45, 3, 37, 22, 37, 82),
  (180, 23, 45, 4, 37, 83, 37, 144),
  (181, 23, 46, 1, 37, 145, 38, 20),
  (182, 23, 46, 2, 38, 21, 38, 51),
  (183, 23, 46, 3, 38, 52, 39, 7),
  (184, 23, 46, 4, 39, 8, 39, 31),
  (185, 24, 47, 1, 39, 32, 39, 52),
  (186, 24, 47, 2, 39, 53, 39, 75),
  (187, 24, 47, 3, 40, 1, 40, 20),
  (188, 24, 47, 4, 40, 21, 40, 40),
  (189, 24, 48, 1, 40, 41, 40, 65),
  (190, 24, 48, 2, 40, 66, 41, 8),
  (191, 24, 48, 3, 41, 9, 41, 24),
  (192, 24, 48, 4, 41, 25, 41, 46),
  (193, 25, 49, 1, 41, 47, 42, 12),
  (194, 25, 49, 2, 42, 13, 42, 26),
  (195, 25, 49, 3, 42, 27, 42, 50),
  (196, 25, 49, 4, 42, 51, 43, 23),
  (197, 25, 50, 1, 43, 24, 43, 56),
  (198, 25, 50, 2, 43, 57, 44, 16),
  (199, 25, 50, 3, 44, 17, 45, 11),
  (200, 25, 50, 4, 45, 12, 45, 37),
  (201, 26, 51, 1, 46, 1, 46, 20),
  (202, 26, 51, 2, 46, 21, 47, 9),
  (203, 26, 51, 3, 47, 10, 47, 32),
  (204, 26, 51, 4, 47, 33, 48, 17),
  (205, 26, 52, 1, 48, 18, 48, 29),
  (206, 26, 52, 2, 49, 1, 49, 13),
  (207, 26, 52, 3, 49, 14, 50, 26),
  (208, 26, 52, 4, 50, 27, 51, 30),
  (209, 27, 53, 1, 51, 31, 52, 23),
  (210, 27, 53, 2, 52, 24, 53, 25),
  (211, 27, 53, 3, 53, 26, 54, 8),
  (212, 27, 53, 4, 54, 9, 54, 55),
  (213, 27, 54, 1, 55, 1, 55, 78),
  (214, 27, 54, 2, 56, 1, 56, 74),
  (215, 27, 54, 3, 56, 75, 57, 15),
  (216, 27, 54, 4, 57, 16, 57, 29),
  (217, 28, 55, 1, 58, 1, 58, 13),
  (218, 28, 55, 2, 58, 14, 59, 10),
  (219, 28, 55, 3, 59, 11, 60, 6),
  (220, 28, 55, 4, 60, 7, 61, 14),
  (221, 28, 56, 1, 62, 1, 63, 3),
  (222, 28, 56, 2, 63, 4, 64, 18),
  (223, 28, 56, 3, 65, 1, 65, 12),
  (224, 28, 56, 4, 66, 1, 66, 12),
  (225, 29, 57, 1, 67, 1, 67, 30),
  (226, 29, 57, 2, 68, 1, 68, 52),
  (227, 29, 57, 3, 69, 1, 70, 18),
  (228, 29, 57, 4, 70, 19, 71, 28),
  (229, 29, 58, 1, 72, 1, 73, 19),
  (230, 29, 58, 2, 73, 20, 74, 56),
  (231, 29, 58, 3, 75, 1, 76, 18),
  (232, 29, 58, 4, 76, 19, 77, 50),
  (233, 30, 59, 1, 78, 1, 79, 46),
  (234, 30, 59, 2, 80, 1, 81, 29),
  (235, 30, 59, 3, 82, 1, 83, 36),
  (236, 30, 59, 4, 84, 1, 86, 17),
  (237, 30, 60, 1, 87, 1, 89, 30),
  (238, 30, 60, 2, 90, 1, 93, 11),
  (239, 30, 60, 3, 94, 1, 100, 8),
  (240, 30, 60, 4, 100, 9, 114, 6);
