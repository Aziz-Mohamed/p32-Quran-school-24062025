# Full-Scope Checklist: Gamification Redesign

**Purpose**: Validate requirement quality, clarity, and completeness across all domains of the gamification redesign specification
**Created**: 2026-02-20
**Feature**: [spec.md](../spec.md) | [plan.md](../plan.md) | [data-model.md](../data-model.md)
**Depth**: Standard | **Audience**: Reviewer

## Requirement Completeness

- [x] CHK001 - Are requirements defined for how `current_level` on the students table gets updated when certifications change? [Completeness, Spec §FR-004] — *data-model.md: "cached, updated by app layer"; research.md R-007: lazy write-back; contracts GS-016: `updateStudentLevel()`*
- [x] CHK002 - Are requirements specified for what the parent role sees on the progress map (read-only, which children)? [Completeness, Spec §Assumptions] — *spec.md Assumptions: "parents see children...same progress map component in read-only mode"; data-model.md RLS: "Parent: SELECT children's records"*
- [x] CHK003 - Are requirements specified for what the admin role sees on the progress map (school-wide or per-student)? [Completeness, Spec §Assumptions] — *spec.md Assumptions: "admins see school...same progress map component in read-only mode" (per-student, not aggregate); data-model.md RLS: admin SELECT+INSERT+UPDATE on school students*
- [x] CHK004 - Are requirements defined for the leaderboard after the level system changes (still ranked by sticker points only)? [Completeness, Spec §FR-014] — *FR-014: "Sticker points MUST only affect leaderboard ranking, NOT the student's level"; contracts GS-004: orders by `total_points`; US-5 S2 explicitly tests this*
- [x] CHK005 - Are loading state requirements defined for the 30-juz progress map on first open? [Gap] — *FR-009 updated: "Loading state: standard spinner while fetching data. Empty state (zero certifications): all 240 rubʿ shown as dashed-gray (uncertified)."*
- [x] CHK006 - Are empty state requirements defined for a student with zero certifications viewing the progress map? [Gap, Spec §US-3] — *US-6 S3: "Level 0 / 240 with an empty progress bar"; FR-009: all 240 rubʿ as dashed-gray; data-model.md: Uncertified = "Gray (dashed border)"*
- [x] CHK007 - Are requirements defined for the undo UI element (toast/snackbar, position, dismiss behavior)? [Gap, Spec §FR-019] — *FR-019 updated: "toast/snackbar at the bottom of the screen with an 'Undo' action button; auto-dismisses when the timer expires"*
- [x] CHK008 - Is the rubʿ reference data sourcing requirement documented (where the 240-row seed data comes from)? [Completeness, Spec §FR-011] — *research.md R-001: Tarteel QUL primary, alquran.cloud/quran-meta fallback; spec.md Assumptions: "standard Quran metadata databases"*
- [x] CHK009 - Are requirements defined for what happens to `total_points` and `current_streak` columns after the redesign? [Gap, Spec §US-5] — *data-model.md Modified Tables: `total_points` "Keep — Still used for sticker leaderboard", `current_streak` "Keep — Still used for display", `longest_streak` "Keep"*
- [x] CHK010 - Are requirements specified for how the sticker `handle_sticker_points()` trigger changes (remove level update, keep points)? [Gap, Spec §FR-014] — *data-model.md: "Remove `current_level` update. Keep only `total_points += sticker.points_value`"; research.md R-005 confirms*

## Requirement Clarity

- [x] CHK011 - Is the "~30 seconds" undo grace period in FR-019 specified as an exact value or acceptable range? [Clarity, Spec §FR-019] — *FR-019 updated: "30 seconds (client-side `setTimeout`)" — exact value, no tilde*
- [x] CHK012 - Is "freshness > 0%" in FR-004 specified with rounding behavior (e.g., does 0.4% round to 0% or 1%)? [Clarity, Spec §FR-004] — *FR-003 updated: "Freshness uses `Math.floor()` — 0.4% rounds to 0% (dormant)"; FR-004: "`Math.floor(freshness) >= 1`"*
- [x] CHK013 - Is the freshness formula explicitly defined with a mathematical expression, not just prose? [Clarity, Spec §FR-003] — *data-model.md: `freshness = max(0, (1 - days_elapsed / interval_days)) * 100` with `days_elapsed = (Date.now() - Date.parse(last_reviewed_at)) / MS_PER_DAY`*
- [x] CHK014 - Are the 6 freshness color states (green, yellow, orange, red, gray, dashed-gray) mapped to exact percentage bands? [Clarity, Spec §US-3 Scenario 3] — *data-model.md Freshness States table: Fresh 75-100% Green, Fading 50-74% Yellow, Warning 25-49% Orange, Critical 1-24% Red, Dormant 0% Gray, Uncertified N/A dashed-gray*
- [x] CHK015 - Is "review count stays unchanged" in FR-007 (Poor revision) explicit that it also means the decay interval stays the same? [Clarity, Spec §FR-007] — *FR-007: "leave review count unchanged, and keep the decay interval the same" — explicitly stated*
- [x] CHK016 - Is the meaning of "freshness resets to 50%" for Poor revision defined relative to the decay interval (50% of interval remaining, or fixed 50% value)? [Clarity, Spec §FR-007] — *FR-007 updated: "set `last_reviewed_at` to `now - (interval_days * 0.5 days)` so the decay formula yields exactly 50%"; contracts GS-012 updated to match*
- [x] CHK017 - Are the dormancy tier boundaries inclusive or exclusive (e.g., exactly 30 days — does it fall in 0-30 or 30-90)? [Clarity, Spec §FR-008] — *FR-008 updated: "Boundaries are inclusive on the lower end (exactly 30 days → 0-30 tier; exactly 31 days → 30-90 tier; exactly 90 days → 30-90 tier; 91 days → 90+ tier)"*
- [x] CHK018 - Is "rubʿ needing revision" quantified with a specific freshness threshold for the warning count? [Clarity, Spec §US-3 Scenario 5] — *FR-015 updated: "'Needing revision' = rubʿ in warning (25-49%) or critical (1-24%) freshness states"*

## Requirement Consistency

- [x] CHK019 - Does US-2 Scenario 3 (Poor revision keeps count unchanged) align with FR-007 on decay interval behavior? [Consistency, Spec §US-2/FR-007] — *US-2 S3: "review count stays unchanged, decay interval stays the same"; FR-007: identical wording. Consistent.*
- [x] CHK020 - Does the spec's "39 stickers across 5 tiers" in FR-013 match the actual sticker inventory (39 remaining after removing 10 trophy-tier + verifying 4 "extra" tier stickers)? [Consistency, Spec §FR-013] — *Original migration 00007 has 49 stickers; data-model.md lists 10 trophy-tier by ID; 49 - 10 = 39. Consistent.*
- [x] CHK021 - Are the spaced repetition intervals in US-4 Scenario 1-4 consistent with the decay table in the design document? [Consistency, Spec §FR-005/US-4] — *US-4 S1: 0 reviews/14d=dormant (table: 0→14). S2: 3 reviews/11d=~75% (calc: (1-11/45)*100=75.6%). S3: 3 reviews/45d=dormant (table: 3→45). S4: 12+/120d=dormant (table: 12+→120). All consistent.*
- [x] CHK022 - Does FR-017 (teacher/admin access) align with all acceptance scenarios in US-1 and US-2 (only teacher scenarios tested, no admin scenarios)? [Consistency, Spec §FR-017/US-1/US-2] — *spec.md Assumptions updated: "Admin certification/revision follows the same UX paths as teachers — no separate admin acceptance scenarios needed. RLS grants admin access at the school level."*
- [x] CHK023 - Is the "certified_by" field behavior consistent across certification (FR-001) and re-certification (FR-008) — does re-certification update the certifying teacher? [Consistency, Spec §FR-001/FR-008] — *contracts GS-013 recertifyRub: updates `certified_by: certifiedBy`. GS-009 certifyRub: inserts `certified_by`. Re-certification updates the teacher. Consistent.*

## Acceptance Criteria Quality

- [x] CHK024 - Can SC-001 ("certify in under 10 seconds") be objectively measured without specifying device/network conditions? [Measurability, Spec §SC-001] — *SC-001 updated: "on a typical modern smartphone (2020+) with stable internet (4G/WiFi). This is a usability target, not a hard SLA."*
- [x] CHK025 - Can SC-005 ("no more than 1% rounding deviation") be verified without defining the reference computation? [Measurability, Spec §SC-005] — *data-model.md provides exact reference formula: `freshness = max(0, (1 - days_elapsed / interval_days)) * 100`. Deviation can be measured against this.*
- [x] CHK026 - Is SC-006 ("100% of old gamification elements removed") verifiable without a complete inventory of what constitutes "old gamification elements"? [Measurability, Spec §SC-006] — *research.md R-006 provides complete inventory: 5 tables, 2 triggers, 24 app files, 10 trophy-tier stickers*
- [x] CHK027 - Are acceptance scenarios in US-1 covering the admin path for certification, given FR-017 includes admins? [Coverage, Spec §US-1/FR-017] — *spec.md Assumptions: "Admin follows the same UX paths as teachers — no separate admin acceptance scenarios needed." Covered by FR-017 + RLS.*
- [x] CHK028 - Are acceptance scenarios defined for the undo grace period expiring mid-interaction (teacher taps undo at exactly the boundary)? [Coverage, Spec §FR-019] — *spec.md Edge Cases: timer is client-side `setTimeout`; at exact 30 seconds the timer has fired and undo is unavailable. US-1 S6 covers the "after 30s" path.*

## Scenario Coverage

- [x] CHK029 - Are requirements defined for what the teacher sees after certifying and then navigating away before the undo period expires? [Coverage, Spec §FR-019] — *spec.md Edge Cases updated: "navigating away cancels the undo opportunity and the certification becomes permanent"*
- [x] CHK030 - Are requirements defined for teacher certifying rubʿ out of order (e.g., rubʿ 120 before rubʿ 1)? [Coverage, Gap] — *FR-001: "certify individual rubʿ" with no ordering constraint; FR-009: progress map shows all 240 rubʿ; any uncertified rubʿ can be tapped. No ordering restriction exists by design.*
- [x] CHK031 - Are requirements specified for concurrent revision attempts by different teachers (or teacher + admin) on the same rubʿ? [Coverage, Gap] — *spec.md Edge Cases updated: "Last-write-wins. UNIQUE constraint prevents duplicate certifications. Single-teacher-per-class makes this extremely unlikely."*
- [x] CHK032 - Are requirements defined for the progress map when a student transfers between classes (new teacher, same certifications)? [Coverage, Gap] — *spec.md Edge Cases updated: "Certifications belong to the student (via student_id FK), not the class. New teacher gains access via class-based RLS; certifications are preserved."*
- [x] CHK033 - Are requirements defined for how the progress map handles the transition when a rubʿ crosses from one freshness state to another while being viewed? [Coverage, Gap] — *spec.md Edge Cases updated: "Freshness is computed on data fetch, not in real-time. Visual state updates on next fetch or screen focus."*
- [x] CHK034 - Are requirements defined for Poor revision on a dormant rubʿ in the 0-30 day window? [Coverage, Spec §Edge Cases] — *spec.md Edge Cases: "A poor revision does NOT restore a dormant rubʿ — only a 'Good' revision or re-certification (for 90+ day dormancy) can restore it." Applies to ALL dormancy windows.*

## Edge Case Coverage

- [x] CHK035 - Are requirements defined for a student at Level 240 (all rubʿ active) — is this an achievable end state? [Edge Case, Spec §FR-004] — *FR-004: level = count of active rubʿ; data-model.md: 240 rubʿ total; max level is 240. Achievable by maintaining all 240 certifications active.*
- [x] CHK036 - Are requirements defined for what happens when the certifying teacher's account is deactivated — does `certified_by` become NULL or cascade? [Edge Case, Gap] — *data-model.md (remediated): `certified_by ON DELETE RESTRICT` — teacher profile cannot be deleted while certifications exist*
- [x] CHK037 - Are requirements defined for a rubʿ that goes dormant and is restored multiple times — does the dormancy timer reset each time? [Edge Case, Spec §FR-008] — *data-model.md state transition diagram: Active→Dormant→Active cycle is repeatable; `dormant_since` set to NULL on restore, new timestamp on next dormancy. Timer resets each cycle.*
- [x] CHK038 - Are requirements specified for the decay interval when `review_count` is between defined thresholds (e.g., 4, which falls between 3 and 6-8)? [Edge Case, Spec §Edge Cases] — *data-model.md decay table uses ranges: "4-5 → 60 days". review_count=4 explicitly falls in this range. All integer values 0-12+ are covered. spec.md Edge Cases updated to match.*
- [x] CHK039 - Are requirements defined for the undo interaction when the app goes to background during the grace period? [Edge Case, Spec §FR-019] — *spec.md Edge Cases updated: "The timer continues. If it fires while backgrounded, undo is unavailable on return."*

## Non-Functional Requirements

- [x] CHK040 - Are offline behavior requirements specified for certification/revision actions when the device loses connectivity? [Gap, Non-Functional] — *spec.md Assumptions updated: "Certification/revision actions require network connectivity (Supabase SDK). On network failure, a standard error toast is shown. No offline queue."*
- [x] CHK041 - Are accessibility requirements defined for the progress map's color-coded freshness states (colorblind-safe alternatives)? [Gap, Non-Functional] — *spec.md Assumptions updated: "Freshness colors include textual labels alongside colors (percentage, state name). Colors are supplementary, not the sole indicator."*
- [x] CHK042 - Are i18n requirements specified for rubʿ-related terms, surah names, and number formatting in Arabic vs English? [Non-Functional, Spec §Assumptions] — *spec.md Assumptions updated: "Rubʿ-related i18n terms provided in both languages. Number formatting uses locale defaults (`Intl.NumberFormat`). No forced Arabic-Indic numeral conversion."*
- [x] CHK043 - Are RTL layout requirements addressed for the juz-based progress map (expand direction, number positioning)? [Non-Functional, Gap] — *spec.md Assumptions updated: "Progress map uses logical CSS (`paddingStart`/`paddingEnd`, `flexDirection: 'row'`). Juz list and rubʿ blocks reflow naturally in RTL."*

## Dependencies & Assumptions

- [x] CHK044 - Is the assumption "freshness is computed on read" validated against the dormancy write-back requirement (client must write `dormant_since` back to server)? [Assumption, Spec §Assumptions] — *research.md R-003: "Lazy client write-back as primary mechanism." Freshness is computed on read; dormancy is detected as a side-effect and written back via GS-015 `markDormant()`. No conflict.*
- [x] CHK045 - Is the assumption "no production data exists" explicitly validated, and are migration rollback requirements excluded intentionally? [Assumption, Spec §Assumptions] — *spec.md Assumptions: "No production data exists — the system can be rebuilt from scratch without migration concerns for existing users." Explicit and intentional.*
- [x] CHK046 - Is the dependency on an external rubʿ verse boundary dataset documented with a specific source and fallback? [Dependency, Spec §Assumptions] — *research.md R-001: Primary source (Tarteel QUL), cross-verified with alquran.cloud API, fallback to quran-meta npm (MIT)*
- [x] CHK047 - Is the relationship between this feature and the existing memorization tracking system (migration 00009) documented — are they independent or overlapping? [Dependency, Gap] — *spec.md Assumptions updated: "Independent systems. Migration 00009 tracks fine-grained verse-level session data with SM-2 scoring. This feature tracks coarse-grained rubʿ-level certification for gamification leveling. They coexist without conflict."*

## Ambiguities & Conflicts

- [x] CHK048 - Does "dormant_since is updated when the system detects" conflict with the client-side computation model (who is "the system" — client or server)? [Ambiguity, Spec §Assumptions] — *research.md R-003 resolves: "the system" = client app via lazy write-back on app open/focus. Idempotent and race-safe.*
- [x] CHK049 - Is there a conflict between FR-013 stating "5 tiers" and the existing sticker schema having 6 tiers (common, rare, epic, legendary, seasonal + the 4 "extra" stickers labeled as common)? [Conflict, Spec §FR-013] — *Migration removes 'trophy' tier from CHECK constraint (6→5 tiers). research.md R-005 confirms 39 stickers across 5 remaining tiers. No conflict post-migration.*
- [x] CHK050 - Is "re-certify as if it were new" in US-2 Scenario 6 unambiguous about whether it creates a new row or updates the existing certification record? [Ambiguity, Spec §US-2] — *contracts GS-013 recertifyRub: uses `.update()` on existing row (resets certified_by, certified_at, review_count, last_reviewed_at, dormant_since). UNIQUE constraint enforces one row per student+rubʿ. Unambiguous.*

## Notes

- Check items off as completed: `[x]`
- Items marked `[Gap]` indicate missing requirements that should be added to the spec
- Items marked `[Ambiguity]` or `[Conflict]` should be resolved before implementation
- Items marked `[Clarity]` suggest the existing requirement needs sharper definition
- Reference the data model at `data-model.md` and contracts at `contracts/supabase-queries.md` for technical context
