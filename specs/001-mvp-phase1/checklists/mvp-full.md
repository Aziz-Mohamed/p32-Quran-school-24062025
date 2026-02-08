# MVP Requirements Quality Checklist: Quran School MVP (Phase 1)

**Purpose**: Lightweight per-iteration check — only items that would block or derail implementation if unresolved
**Created**: 2026-02-08
**Feature**: [spec.md](../spec.md)

## Auth & Account Creation

- [ ] CHK001 - Is the login flow fully specified — does the user need a school slug/identifier alongside username, or just username + password? [Clarity, Spec §FR-002]
- [ ] CHK002 - Are password strength requirements specified (minimum length, complexity)? [Gap, Spec §FR-001/FR-026]
- [ ] CHK003 - Are rollback requirements defined for Edge Function partial failures (e.g., auth user created but school insert fails)? [Gap, EF-001/EF-002]
- [ ] CHK004 - Are requirements defined for non-Latin names in username generation (Arabic script input)? [Edge Case, Spec §Clarifications Q5]

## Gamification — Blocking Ambiguities

- [ ] CHK005 - Is "activity day" for streak calculation defined — what events count (session, homework, login, any point-earning event)? [Clarity, Spec §FR-013]
- [ ] CHK006 - Is "perfect weekly attendance" (+20 pts) defined — how many days, and do excused absences count? [Clarity, Spec §FR-031]
- [ ] CHK007 - Are concrete trophy/achievement criteria defined, or is the JSONB `criteria` field left without examples to implement against? [Completeness, Spec §FR-034/FR-035]
- [ ] CHK008 - When/how is trophy auto-awarding triggered — on every points update, or on specific events? [Gap, Spec §FR-034]

## Missing CRUD Flows

- [ ] CHK009 - Are requirements defined for admin managing the sticker catalog (create, edit, deactivate stickers)? [Gap]
- [ ] CHK010 - Are requirements defined for who creates lessons and assigns them to classes (teacher, admin, both)? [Gap]
- [ ] CHK011 - Is the homework completion flow specified from the student's perspective — how do they mark it done? [Gap]
- [ ] CHK012 - Are requirements defined for editing/deleting a session after creation? [Gap]

## Dashboard Vagueness

- [ ] CHK013 - Is "progress overview" on the student dashboard quantified — what metrics, what visualization? [Ambiguity, Spec §FR-007]
- [ ] CHK014 - Are "alerts" on the teacher dashboard defined — what triggers them? [Ambiguity, Spec §FR-015]
- [ ] CHK015 - Is "declining scores" for teacher "Needs Support" defined with a measurable threshold? [Ambiguity, Spec US-7]

## Consistency Issues

- [ ] CHK016 - Does the spec say 10 levels (FR-032) while `src/lib/constants.ts` has 9 — which is correct? [Conflict]
- [ ] CHK017 - Is attendance marking admin-only (FR-030) or also teacher-allowed (per RLS policies)? [Consistency, Schema vs Spec]
- [ ] CHK018 - Is the `homework_assigned` text field on `sessions` redundant with the separate `homework` table — which is canonical? [Consistency, Data Model]

## Key Edge Cases

- [ ] CHK019 - Can a student with no class still have sessions logged and appear on a leaderboard? [Edge Case]
- [ ] CHK020 - Can a teacher award the same sticker to the same student multiple times? [Edge Case]
- [ ] CHK021 - Does deactivating a student/teacher revoke their auth session? [Edge Case, Spec §FR-026]

## Security — Implementation Blockers

- [ ] CHK022 - Are rate limiting requirements specified for the public `create-school` endpoint? [Gap, Security]
- [ ] CHK023 - Are brute-force protections specified for login (lockout after N failures)? [Gap, Security]

## UX Gaps

- [ ] CHK024 - Are confirmation dialogs specified for destructive actions (deactivate, remove from class)? [Gap, UX]
- [ ] CHK025 - Are success/error feedback patterns specified for write operations (toast, inline, redirect)? [Gap, UX]

## Notes

- `[Gap]` = missing requirement, needs spec update or explicit "deferred" decision
- `[Ambiguity]` = vague language that forces implementation guesswork
- `[Consistency]` = spec sections or spec-vs-code contradict each other
- `[Conflict]` = confirmed contradiction requiring resolution before implementation
