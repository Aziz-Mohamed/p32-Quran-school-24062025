-- Remove sticker points system (vestige of old gamification)
-- Levels are now rubʿ-based; stickers are purely social/collectible.

-- Drop the trigger and function that auto-updated total_points on sticker award
DROP TRIGGER IF EXISTS on_sticker_awarded ON public.student_stickers;
DROP FUNCTION IF EXISTS public.handle_sticker_points();

-- Drop orphaned trophy/achievement trigger that also depends on total_points
DROP TRIGGER IF EXISTS on_student_stats_changed ON public.students;
DROP FUNCTION IF EXISTS public.check_trophy_achievement_awards();

-- Drop points columns
ALTER TABLE public.students DROP COLUMN IF EXISTS total_points;
ALTER TABLE public.stickers DROP COLUMN IF EXISTS points_value;
