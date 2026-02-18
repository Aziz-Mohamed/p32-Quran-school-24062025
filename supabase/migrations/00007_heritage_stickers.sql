-- ============================================================
-- Migration 00007: Replace school-scoped stickers with global heritage stickers
-- ============================================================

-- 1. Drop old tables (student_stickers references stickers, so drop it first)
DROP TABLE IF EXISTS student_stickers CASCADE;
DROP TABLE IF EXISTS stickers CASCADE;

-- Drop old trigger function (will be recreated)
DROP FUNCTION IF EXISTS handle_sticker_points() CASCADE;

-- 2. Create new global stickers catalog
CREATE TABLE stickers (
  id text PRIMARY KEY,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  tier text NOT NULL DEFAULT 'common'
    CHECK (tier IN ('common','rare','epic','legendary','seasonal','trophy')),
  image_path text NOT NULL,
  points_value integer NOT NULL DEFAULT 10 CHECK (points_value >= 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Create student_stickers (NO unique constraint — same sticker can be earned multiple times)
CREATE TABLE student_stickers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  sticker_id text NOT NULL REFERENCES stickers(id),
  awarded_by uuid NOT NULL REFERENCES profiles(id),
  awarded_at timestamptz NOT NULL DEFAULT now(),
  reason text,
  is_new boolean NOT NULL DEFAULT true
);

-- Index for common queries
CREATE INDEX idx_student_stickers_student ON student_stickers(student_id);
CREATE INDEX idx_student_stickers_sticker ON student_stickers(sticker_id);
CREATE INDEX idx_student_stickers_awarded_at ON student_stickers(awarded_at DESC);

-- 4. Recreate handle_sticker_points trigger function
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
  SET total_points = total_points + COALESCE(sticker_points, 0),
      current_level = (
        SELECT level_number FROM levels
        WHERE points_required <= (total_points + COALESCE(sticker_points, 0))
        ORDER BY level_number DESC LIMIT 1
      )
  WHERE id = NEW.student_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_sticker_awarded
  AFTER INSERT ON student_stickers
  FOR EACH ROW
  EXECUTE FUNCTION handle_sticker_points();

-- 5. Enable RLS
ALTER TABLE stickers ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_stickers ENABLE ROW LEVEL SECURITY;

-- 6. RLS policies for stickers (global catalog — everyone can read)
CREATE POLICY "Anyone can read stickers"
  ON stickers FOR SELECT
  USING (true);

-- 7. RLS policies for student_stickers
CREATE POLICY "Admin can read school student stickers"
  ON student_stickers FOR SELECT
  USING (
    get_user_role() = 'admin'
    AND student_id IN (
      SELECT id FROM students WHERE school_id = get_user_school_id()
    )
  );

CREATE POLICY "Teacher can read class student stickers"
  ON student_stickers FOR SELECT
  USING (
    get_user_role() = 'teacher'
    AND student_id IN (
      SELECT s.id FROM students s
      JOIN classes c ON s.class_id = c.id
      WHERE c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teacher can award stickers"
  ON student_stickers FOR INSERT
  WITH CHECK (
    get_user_role() = 'teacher'
    AND awarded_by = auth.uid()
    AND student_id IN (
      SELECT s.id FROM students s
      JOIN classes c ON s.class_id = c.id
      WHERE c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Admin can award stickers"
  ON student_stickers FOR INSERT
  WITH CHECK (
    get_user_role() = 'admin'
    AND student_id IN (
      SELECT id FROM students WHERE school_id = get_user_school_id()
    )
  );

CREATE POLICY "Admin can delete student stickers"
  ON student_stickers FOR DELETE
  USING (
    get_user_role() = 'admin'
    AND student_id IN (
      SELECT id FROM students WHERE school_id = get_user_school_id()
    )
  );

CREATE POLICY "Student can read own stickers"
  ON student_stickers FOR SELECT
  USING (
    get_user_role() = 'student'
    AND student_id = auth.uid()
  );

CREATE POLICY "Parent can read children stickers"
  ON student_stickers FOR SELECT
  USING (
    get_user_role() = 'parent'
    AND student_id IN (
      SELECT id FROM students WHERE parent_id = auth.uid()
    )
  );

-- 8. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE student_stickers;

-- 9. Seed all 49 heritage stickers
INSERT INTO stickers (id, name_ar, name_en, tier, image_path, points_value) VALUES
-- Common (8)
('holy-quran', 'المصحف الشريف', 'Holy Quran', 'common', 'holy-quran.png', 10),
('prayer-beads', 'المسبحة', 'Prayer Beads', 'common', 'prayer-beads.png', 10),
('prayer-beads-v3', 'المسبحة', 'Prayer Beads (Alt)', 'common', 'prayer-beads-v3.png', 10),
('quill-and-inkwell', 'القلم والمحبرة', 'Quill & Inkwell', 'common', 'quill-and-inkwell.png', 10),
('memorization-tablet', 'لوح المحفوظ', 'Memorization Tablet', 'common', 'memorization-tablet.png', 10),
('traditional-lantern', 'الفانوس', 'Traditional Lantern', 'common', 'traditional-lantern.png', 10),
('dates-and-milk', 'التمر واللبن', 'Dates & Milk', 'common', 'dates-and-milk.png', 10),
('prayer-rug', 'سجادة الصلاة', 'Prayer Rug', 'common', 'prayer-rug.png', 10),
-- Rare (9)
('astrolabe-v2', 'الأسطرلاب', 'Astrolabe', 'rare', 'astrolabe-v2.png', 25),
('arabesque-arch', 'بوابة الأرابيسك', 'Arabesque Arch', 'rare', 'arabesque-arch.png', 25),
('minaret-v2', 'المئذنة', 'Minaret', 'rare', 'minaret-v2.png', 25),
('kufic-calligraphy', 'الخط الكوفي', 'Kufic Calligraphy', 'rare', 'kufic-calligraphy.png', 25),
('house-of-wisdom-scroll-v2', 'بيت الحكمة', 'House of Wisdom Scroll', 'rare', 'house-of-wisdom-scroll-v2.png', 25),
('islamic-dome', 'القبة', 'Islamic Dome', 'rare', 'islamic-dome.png', 25),
('mishkat-lamp', 'المشكاة', 'Mishkat Lamp', 'rare', 'mishkat-lamp.png', 25),
('noahs-ark', 'السفينة', 'Noah''s Ark', 'rare', 'noahs-ark.png', 25),
('compass', 'البوصلة', 'Compass', 'rare', 'compass.png', 25),
-- Epic (10)
('dhul-fiqar-sword', 'ذو الفقار', 'Dhul Fiqar Sword', 'epic', 'dhul-fiqar-sword.png', 50),
('dome-of-the-rock', 'قبة الصخرة', 'Dome of the Rock', 'epic', 'dome-of-the-rock.png', 50),
('muqarnas', 'المقرنصات', 'Muqarnas', 'epic', 'muqarnas.png', 50),
('the-kaaba', 'الكعبة المشرفة', 'The Kaaba', 'epic', 'the-kaaba.png', 50),
('zamzam-well', 'عين زمزم', 'Zamzam Well', 'epic', 'zamzam-well.png', 50),
('gate-of-peace', 'باب السلام', 'Gate of Peace', 'epic', 'gate-of-peace.png', 50),
('salihs-camel', 'الناقة', 'Salih''s Camel', 'epic', 'salihs-camel.png', 50),
('staff-of-musa', 'عصا موسى', 'Staff of Musa', 'epic', 'staff-of-musa.png', 50),
('prophets-minbar-v2', 'المنبر النبوي', 'Prophet''s Minbar', 'epic', 'prophets-minbar-v2.png', 50),
('islamic-dinar', 'الدرهم الإسلامي', 'Islamic Dinar', 'epic', 'islamic-dinar.png', 50),
-- Legendary (2)
('the-rawdah', 'الروضة الشريفة', 'The Rawdah', 'legendary', 'the-rawdah.png', 100),
('seal-of-prophethood', 'خاتم النبوة', 'Seal of Prophethood', 'legendary', 'seal-of-prophethood.png', 100),
-- Seasonal (6)
('ramadan-cannon', 'مدفع رمضان', 'Ramadan Cannon', 'seasonal', 'ramadan-cannon.png', 30),
('eid-cookies', 'كعك العيد', 'Eid Cookies', 'seasonal', 'eid-cookies.png', 30),
('eid-lamb', 'خروف العيد', 'Eid Lamb', 'seasonal', 'eid-lamb.png', 30),
('tent-of-arafah', 'خيمة عرفة', 'Tent of Arafah', 'seasonal', 'tent-of-arafah.png', 30),
('kiswah-cloth', 'كسوة الكعبة', 'Kiswah Cloth', 'seasonal', 'kiswah-cloth.png', 30),
('ramadan-crescent', 'هلال رمضان', 'Ramadan Crescent', 'seasonal', 'ramadan-crescent.png', 30),
-- Trophy (10)
('memorization-excellence', 'التميز في الحفظ', 'Memorization Excellence', 'trophy', 'memorization-excellence.png', 75),
('perfect-tajweed', 'إتقان التجويد', 'Perfect Tajweed', 'trophy', 'perfect-tajweed.png', 75),
('consistent-recitation', 'المداومة على التلاوة', 'Consistent Recitation', 'trophy', 'consistent-recitation.png', 75),
('best-effort', 'أفضل جهد', 'Best Effort', 'trophy', 'best-effort.png', 75),
('helping-others', 'مساعدة الآخرين', 'Helping Others', 'trophy', 'helping-others.png', 75),
('streak-master', 'سيد المواظبة', 'Streak Master', 'trophy', 'streak-master.png', 75),
('streak-7-days', 'مواظبة ٧ أيام', '7-Day Streak', 'trophy', 'streak-7-days.png', 75),
('streak-30-days', 'مواظبة ٣٠ يوم', '30-Day Streak', 'trophy', 'streak-30-days.png', 75),
('complete-full-juz', 'إتمام جزء كامل', 'Complete Full Juz', 'trophy', 'complete-full-juz.png', 75),
('top-of-leaderboard-for-week', 'متصدر لوحة الشرف', 'Top of Leaderboard', 'trophy', 'top-of-leaderboard-for-week.png', 75),
-- Extra (4)
('salah-eldins-eagle-v3', 'نسر صلاح الدين', 'Salah El-Din''s Eagle', 'common', 'salah-eldins-eagle-v3.png', 15),
('ornate-key', 'المفتاح', 'Ornate Key', 'common', 'ornate-key.png', 15),
('mosque', 'المسجد', 'Mosque', 'common', 'mosque.png', 15),
('decorative-column', 'العمود', 'Decorative Column', 'common', 'decorative-column.png', 15);
