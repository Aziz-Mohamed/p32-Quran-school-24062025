# MVP Requirements Quality Checklist: Quran School MVP (Phase 1)

**Purpose**: Lightweight per-iteration check — only items that would block or derail implementation if unresolved
**Created**: 2026-02-08
**Resolved**: 2026-02-08
**Feature**: [spec.md](../spec.md)

## Auth & Account Creation

- [x] CHK001 - Is the login flow fully specified — does the user need a school slug/identifier alongside username, or just username + password? [Clarity, Spec §FR-002] → **Resolved**: Login requires username + password + school slug. Slug stored locally after first login. Added to Assumptions.
- [x] CHK002 - Are password strength requirements specified (minimum length, complexity)? [Gap, Spec §FR-001/FR-026] → **Resolved**: Minimum 6 characters, no complexity requirements in Phase 1. Added to Assumptions.
- [x] CHK003 - Are rollback requirements defined for Edge Function partial failures (e.g., auth user created but school insert fails)? [Gap, EF-001/EF-002] → **Resolved**: Edge Functions implement rollback — delete auth user on downstream failure. Added to Assumptions.
- [x] CHK004 - Are requirements defined for non-Latin names in username generation (Arabic script input)? [Edge Case, Spec §Clarifications Q5] → **Resolved**: Usernames must be Latin only (a-z, 0-9, underscore). Admin enters name in Latin script. Added to Assumptions.

## Gamification — Blocking Ambiguities

- [x] CHK005 - Is "activity day" for streak calculation defined — what events count (session, homework, login, any point-earning event)? [Clarity, Spec §FR-013] → **Resolved**: Activity day = present or late in attendance. FR-013 updated, Clarification added.
- [x] CHK006 - Is "perfect weekly attendance" (+20 pts) defined — how many days, and do excused absences count? [Clarity, Spec §FR-031] → **Resolved**: +20 awarded when streak reaches a multiple of 7 consecutive present/late days. Excused breaks streak. FR-031 updated.
- [x] CHK007 - Are concrete trophy/achievement criteria defined, or is the JSONB `criteria` field left without examples to implement against? [Completeness, Spec §FR-034/FR-035] → **Resolved**: 5 trophies and 3 achievements with concrete JSONB criteria defined. FR-034/FR-035 updated, seed data in data-model.md.
- [x] CHK008 - When/how is trophy auto-awarding triggered — on every points update, or on specific events? [Gap, Spec §FR-034] → **Resolved**: DB trigger on `students` fires AFTER UPDATE of total_points or current_streak. Clarification added.

## Missing CRUD Flows

- [x] CHK009 - Are requirements defined for admin managing the sticker catalog (create, edit, deactivate stickers)? [Gap] → **Resolved**: FR-029b added — admin can create, edit, and deactivate stickers. Deactivated stickers remain in existing collections.
- [x] CHK010 - Are requirements defined for who creates lessons and assigns them to classes (teacher, admin, both)? [Gap] → **Resolved**: Both. Admins for any class, teachers for their own classes. Added to Assumptions.
- [x] CHK011 - Is the homework completion flow specified from the student's perspective — how do they mark it done? [Gap] → **Resolved**: Student taps "Mark Complete" button. Sets is_completed=true, completed_at=now(). Added to Assumptions, contract HW-002 covers service.
- [x] CHK012 - Are requirements defined for editing/deleting a session after creation? [Gap] → **Resolved**: Sessions are immutable in Phase 1. No edit/delete to preserve points integrity. Added to Assumptions.

## Dashboard Vagueness

- [x] CHK013 - Is "progress overview" on the student dashboard quantified — what metrics, what visualization? [Ambiguity, Spec §FR-007] → **Resolved**: FR-007 updated — progress overview = points-to-next-level progress bar, sessions this week, homework completion rate.
- [x] CHK014 - Are "alerts" on the teacher dashboard defined — what triggers them? [Ambiguity, Spec §FR-015] → **Resolved**: Alerts deferred to Phase 2. FR-015 updated to remove "alerts" — dashboard shows stats and quick actions only.
- [x] CHK015 - Is "declining scores" for teacher "Needs Support" defined with a measurable threshold? [Ambiguity, Spec US-7] → **Resolved**: Average of last 3 sessions < average of previous 3, OR any score < 3 in last 2 sessions. Added to Assumptions.

## Consistency Issues

- [x] CHK016 - Does the spec say 10 levels (FR-032) while `src/lib/constants.ts` has 9 — which is correct? [Conflict] → **Resolved**: 10 levels is correct (per DB seed data). constants.ts will be updated in T024. Added to Assumptions.
- [x] CHK017 - Is attendance marking admin-only (FR-030) or also teacher-allowed (per RLS policies)? [Consistency, Schema vs Spec] → **Resolved**: Both allowed. RLS permits teacher insert/update for own classes. FR-030 updated to note both, with admin bulk UI as primary in Phase 1.
- [x] CHK018 - Is the `homework_assigned` text field on `sessions` redundant with the separate `homework` table — which is canonical? [Consistency, Data Model] → **Resolved**: `homework_assigned` is display-only convenience. `homework` table is canonical. Added to Assumptions.

## Key Edge Cases

- [x] CHK019 - Can a student with no class still have sessions logged and appear on a leaderboard? [Edge Case] → **Resolved**: Sessions yes (student_id sufficient). Leaderboard no (class-scoped). Added to Edge Cases.
- [x] CHK020 - Can a teacher award the same sticker to the same student multiple times? [Edge Case] → **Resolved**: Yes. Each award is a separate event. No unique constraint on student_id + sticker_id. Added to Edge Cases and Assumptions.
- [x] CHK021 - Does deactivating a student/teacher revoke their auth session? [Edge Case, Spec §FR-026] → **Resolved**: No. is_active checked at app layer on login/session restore. Deactivated users see message and are redirected to login. Added to Assumptions.

## Security — Implementation Blockers

- [x] CHK022 - Are rate limiting requirements specified for the public `create-school` endpoint? [Gap, Security] → **Resolved**: Relies on Supabase Edge Function defaults in Phase 1. Custom rate limiting deferred. Added to Assumptions.
- [x] CHK023 - Are brute-force protections specified for login (lockout after N failures)? [Gap, Security] → **Resolved**: Relies on Supabase Auth built-in rate limiting (~30 req/hr/IP) in Phase 1. Custom lockout deferred. Added to Assumptions.

## UX Gaps

- [x] CHK024 - Are confirmation dialogs specified for destructive actions (deactivate, remove from class)? [Gap, UX] → **Resolved**: Required for deactivate, remove from class, password reset. Uses shared ConfirmDialog component (T011). Added to Assumptions.
- [x] CHK025 - Are success/error feedback patterns specified for write operations (toast, inline, redirect)? [Gap, UX] → **Resolved**: Toast for success, inline for errors, redirect to list after create/edit. Added to Assumptions.

## Notes

- `[Gap]` = missing requirement, needs spec update or explicit "deferred" decision
- `[Ambiguity]` = vague language that forces implementation guesswork
- `[Consistency]` = spec sections or spec-vs-code contradict each other
- `[Conflict]` = confirmed contradiction requiring resolution before implementation
- **All 25 items resolved on 2026-02-08** via spec.md updates (FRs, Assumptions, Edge Cases, Clarifications)
