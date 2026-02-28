-- ============================================================================
-- Migration 00010: WiFi Verification for Teacher Check-In
-- Alter: schools (add WiFi config + verification preferences),
--        teacher_checkins (add WiFi data, expand verification_method CHECK)
-- ============================================================================

-- ============================================================================
-- SECTION 1: Alter schools table
-- ============================================================================

-- WiFi network name for verification
ALTER TABLE schools
  ADD COLUMN IF NOT EXISTS wifi_ssid TEXT;

-- Which verification method(s) admin requires
ALTER TABLE schools
  ADD COLUMN IF NOT EXISTS verification_mode TEXT NOT NULL DEFAULT 'gps';

ALTER TABLE schools
  ADD CONSTRAINT schools_verification_mode_check
    CHECK (verification_mode IN ('gps', 'wifi', 'both'));

-- When mode is 'both', whether teacher needs both or just one
ALTER TABLE schools
  ADD COLUMN IF NOT EXISTS verification_logic TEXT NOT NULL DEFAULT 'or';

ALTER TABLE schools
  ADD CONSTRAINT schools_verification_logic_check
    CHECK (verification_logic IN ('and', 'or'));

-- ============================================================================
-- SECTION 2: Alter teacher_checkins table
-- ============================================================================

-- Record WiFi SSID detected at check-in and checkout
ALTER TABLE teacher_checkins
  ADD COLUMN IF NOT EXISTS checkin_wifi_ssid TEXT,
  ADD COLUMN IF NOT EXISTS checkout_wifi_ssid TEXT;

-- Expand verification_method CHECK to include 'wifi' and 'both'
ALTER TABLE teacher_checkins
  DROP CONSTRAINT IF EXISTS teacher_checkins_verification_method_check;

ALTER TABLE teacher_checkins
  ADD CONSTRAINT teacher_checkins_verification_method_check
    CHECK (verification_method IN ('gps', 'wifi', 'both', 'manual', 'none'));
