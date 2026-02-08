# Supabase Schema Reference

> **Generated:** 2026-02-07
> **Database:** Quran School Management System

This document provides a reference for the current Supabase database schema.

## Migration Status

Current migrations applied: **37 migrations**

### Migration History

1. `20251227130923` - 001_create_profiles_and_roles
2. `20251227130940` - 002_create_students_table
3. `20251227131034` - 003_create_gamification_tables
4. `20251227131102` - 004_enable_rls_policies
5. `20251227131156` - 005_create_helper_functions
6. `20251227193815` - create_teachers_table
7. `20251227193843` - add_teacher_rls_policies_v2
8. `20251227195328` - create_parents_table
9. `20251227195342` - add_parent_rls_policies
10. `20251227200038` - create_admins_table
11. `20251227200116` - add_admin_rls_policies_v2
12. `20251227200739` - create_lessons_tables
13. `20251227200819` - add_lessons_rls_policies_v2
14. `20251227201906` - create_sessions_tables
15. `20251227201928` - add_sessions_rls_policies
16. `20251229170705` - fix_handle_new_user_function
17. `20251229171023` - fix_profiles_rls_infinite_recursion
18. `20251229171543` - add_profiles_insert_policy
19. `20251229172013` - simplify_profiles_rls_policies
20. `20251229172450` - fix_trigger_bypass_rls
21. `20251229172511` - update_insert_policy_for_trigger
22. `20251229173025` - fix_select_policy_for_signup
23. `20251229173539` - add_students_levels_foreign_key
24. `20251229173557` - create_student_record_on_signup
25. `20251229175112` - create_trophies_tables
26. `20251229175210` - create_achievements_tables
27. `20260102204923` - seed_demo_data_v2
28. `20260103081648` - seed_final_v2
29. `20260122192456` - create_teacher_check_ins
30. `20260122192510` - create_session_topics_and_links
31. `20260122192538` - create_messaging_tables
32. `20260131125436` - create_academic_terms
33. `20260131125452` - create_school_settings
34. `20260131125500` - create_point_rules
35. `20260131125511` - create_topics
36. `20260131125543` - create_storage_and_rpc
37. `20260201213334` - parent_role_notifications_only
38. `20260201213405` - parent_role_rpc_functions

## Core Tables

### User Management
- **profiles** - User profiles extending Supabase auth.users with app-specific data
- **students** - Student-specific data with gamification tracking
- **teachers** - Teacher-specific data extending profiles
- **parents** - Parent-specific data extending profiles
- **admins** - Admin users who manage the school

### Gamification System
- **levels** - Level definitions with points thresholds and badges
- **stickers** - Sticker catalog with categories and rarities
- **student_stickers** - Junction table tracking stickers students have earned
- **trophies** - Trophy catalog with categories and requirements
- **student_trophies** - Junction table tracking trophies students have earned
- **achievements** - Achievement catalog with progress tracking requirements
- **student_achievements** - Student progress toward achievements
- **point_rules** - Gamification point calculation rules (singleton table)

### Academic Management
- **classes** - Classes for organizing students and teachers
- **class_enrollments** - Student enrollment in classes
- **lessons** - Curriculum lessons and content
- **student_lessons** - Student progress on lessons
- **sessions** - Scheduled learning sessions
- **session_attendees** - Student attendance for sessions
- **session_topics** - Admin-managed topics for categorizing sessions
- **session_topic_links** - Junction table linking sessions to multiple topics
- **topics** - Lesson topics for curriculum management

### Communication
- **conversations** - Message threads between teachers and parents
- **messages** - Individual messages within conversations with read tracking
- **notifications** - Parent notification system
- **notification_preferences** - Parent notification preferences per child

### Relationships & Tracking
- **teacher_students** - Links teachers to their assigned students
- **parent_children** - Links parents to their children (students)
- **teacher_check_ins** - Records teacher daily check-in/out times

### School Settings
- **academic_terms** - Academic terms/semesters for the school
- **school_settings** - School-wide configuration settings (singleton table)

## Enums

- **user_role**: `student`, `teacher`, `parent`, `admin`
- **lesson_type**: `quran_recitation`, `quran_memorization`, `tajweed`, `islamic_studies`
- **lesson_difficulty**: `beginner`, `intermediate`, `advanced`
- **session_status**: `scheduled`, `in_progress`, `completed`, `cancelled`, `missed`
- **sticker_category**: `quran`, `prayer`, `behavior`, `attendance`, `achievement`, `special`
- **sticker_rarity**: `common`, `uncommon`, `rare`, `epic`, `legendary`
- **trophy_category**: `milestone`, `streak`, `completion`, `competition`, `special`
- **achievement_category**: `learning`, `attendance`, `social`, `collection`, `mastery`, `special`

## Key RPC Functions

### Gamification
- `award_points()` - Award points to students with level-up logic
- `award_sticker()` - Award stickers to students
- `deduct_points()` - Deduct points from students
- `update_streak()` - Update student streaks with bonus calculations

### Analytics & Dashboards
- `get_student_dashboard()` - Comprehensive student dashboard data
- `get_child_dashboard_data()` - Parent view of child progress
- `get_school_summary()` - Overall school statistics
- `get_class_metrics()` - Class-level performance metrics
- `get_engagement_trends()` - Student engagement trends over time
- `get_attendance_trends()` - Attendance patterns and rates
- `get_sticker_popularity()` - Most awarded stickers analysis
- `get_teacher_activity()` - Teacher activity and performance metrics
- `get_teacher_statistics()` - Teacher-specific statistics
- `get_students_needing_support()` - Identify at-risk students
- `get_upcoming_classes()` - Scheduled classes for a child

### Parent Data Management
- `export_parent_data()` - Export all parent data (GDPR compliance)
- `request_account_deletion()` - Request account deletion
- `cancel_account_deletion()` - Cancel pending deletion request

## Notes

- **RLS (Row Level Security)** is enabled on most tables
- **TypeScript types** are available in `supabase/types/database.types.ts`
- Schema does NOT use multi-tenancy (no school_id columns)
- The database is a single-school implementation

## Next Steps

To properly sync migrations locally, you need to:

1. **Install Supabase CLI**: The proper way to pull migrations
2. **Use `supabase db pull`**: This will generate migration files from the current schema
3. **Replace the old migration**: The current `00001_initial_schema.sql` is from a different schema design

For now, this reference document and the TypeScript types provide complete visibility into your database structure.
