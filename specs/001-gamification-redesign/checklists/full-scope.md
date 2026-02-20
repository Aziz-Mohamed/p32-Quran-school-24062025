# Full-Scope Checklist: Gamification Redesign

**Purpose**: Validate requirement quality, clarity, and completeness across all domains of the gamification redesign specification
**Created**: 2026-02-20
**Feature**: [spec.md](../spec.md) | [plan.md](../plan.md) | [data-model.md](../data-model.md)
**Depth**: Standard | **Audience**: Reviewer

## Requirement Completeness

- [ ] CHK001 - Are requirements defined for how `current_level` on the students table gets updated when certifications change? [Completeness, Spec §FR-004]
- [ ] CHK002 - Are requirements specified for what the parent role sees on the progress map (read-only, which children)? [Completeness, Spec §Assumptions]
- [ ] CHK003 - Are requirements specified for what the admin role sees on the progress map (school-wide or per-student)? [Completeness, Spec §Assumptions]
- [ ] CHK004 - Are requirements defined for the leaderboard after the level system changes (still ranked by sticker points only)? [Completeness, Spec §FR-014]
- [ ] CHK005 - Are loading state requirements defined for the 30-juz progress map on first open? [Gap]
- [ ] CHK006 - Are empty state requirements defined for a student with zero certifications viewing the progress map? [Gap, Spec §US-3]
- [ ] CHK007 - Are requirements defined for the undo UI element (toast/snackbar, position, dismiss behavior)? [Gap, Spec §FR-019]
- [ ] CHK008 - Is the rubʿ reference data sourcing requirement documented (where the 240-row seed data comes from)? [Completeness, Spec §FR-011]
- [ ] CHK009 - Are requirements defined for what happens to `total_points` and `current_streak` columns after the redesign? [Gap, Spec §US-5]
- [ ] CHK010 - Are requirements specified for how the sticker `handle_sticker_points()` trigger changes (remove level update, keep points)? [Gap, Spec §FR-014]

## Requirement Clarity

- [ ] CHK011 - Is the "~30 seconds" undo grace period in FR-019 specified as an exact value or acceptable range? [Clarity, Spec §FR-019]
- [ ] CHK012 - Is "freshness > 0%" in FR-004 specified with rounding behavior (e.g., does 0.4% round to 0% or 1%)? [Clarity, Spec §FR-004]
- [ ] CHK013 - Is the freshness formula explicitly defined with a mathematical expression, not just prose? [Clarity, Spec §FR-003]
- [ ] CHK014 - Are the 6 freshness color states (green, yellow, orange, red, gray, dashed-gray) mapped to exact percentage bands? [Clarity, Spec §US-3 Scenario 3]
- [ ] CHK015 - Is "review count stays unchanged" in FR-007 (Poor revision) explicit that it also means the decay interval stays the same? [Clarity, Spec §FR-007]
- [ ] CHK016 - Is the meaning of "freshness resets to 50%" for Poor revision defined relative to the decay interval (50% of interval remaining, or fixed 50% value)? [Clarity, Spec §FR-007]
- [ ] CHK017 - Are the dormancy tier boundaries inclusive or exclusive (e.g., exactly 30 days — does it fall in 0-30 or 30-90)? [Clarity, Spec §FR-008]
- [ ] CHK018 - Is "rubʿ needing revision" quantified with a specific freshness threshold for the warning count? [Clarity, Spec §US-3 Scenario 5]

## Requirement Consistency

- [ ] CHK019 - Does US-2 Scenario 3 (Poor revision keeps count unchanged) align with FR-007 on decay interval behavior? [Consistency, Spec §US-2/FR-007]
- [ ] CHK020 - Does the spec's "39 stickers across 5 tiers" in FR-013 match the actual sticker inventory (39 remaining after removing 10 trophy-tier + verifying 4 "extra" tier stickers)? [Consistency, Spec §FR-013]
- [ ] CHK021 - Are the spaced repetition intervals in US-4 Scenario 1-4 consistent with the decay table in the design document? [Consistency, Spec §FR-005/US-4]
- [ ] CHK022 - Does FR-017 (teacher/admin access) align with all acceptance scenarios in US-1 and US-2 (only teacher scenarios tested, no admin scenarios)? [Consistency, Spec §FR-017/US-1/US-2]
- [ ] CHK023 - Is the "certified_by" field behavior consistent across certification (FR-001) and re-certification (FR-008) — does re-certification update the certifying teacher? [Consistency, Spec §FR-001/FR-008]

## Acceptance Criteria Quality

- [ ] CHK024 - Can SC-001 ("certify in under 10 seconds") be objectively measured without specifying device/network conditions? [Measurability, Spec §SC-001]
- [ ] CHK025 - Can SC-005 ("no more than 1% rounding deviation") be verified without defining the reference computation? [Measurability, Spec §SC-005]
- [ ] CHK026 - Is SC-006 ("100% of old gamification elements removed") verifiable without a complete inventory of what constitutes "old gamification elements"? [Measurability, Spec §SC-006]
- [ ] CHK027 - Are acceptance scenarios in US-1 covering the admin path for certification, given FR-017 includes admins? [Coverage, Spec §US-1/FR-017]
- [ ] CHK028 - Are acceptance scenarios defined for the undo grace period expiring mid-interaction (teacher taps undo at exactly the boundary)? [Coverage, Spec §FR-019]

## Scenario Coverage

- [ ] CHK029 - Are requirements defined for what the teacher sees after certifying and then navigating away before the undo period expires? [Coverage, Spec §FR-019]
- [ ] CHK030 - Are requirements defined for teacher certifying rubʿ out of order (e.g., rubʿ 120 before rubʿ 1)? [Coverage, Gap]
- [ ] CHK031 - Are requirements specified for concurrent revision attempts by different teachers (or teacher + admin) on the same rubʿ? [Coverage, Gap]
- [ ] CHK032 - Are requirements defined for the progress map when a student transfers between classes (new teacher, same certifications)? [Coverage, Gap]
- [ ] CHK033 - Are requirements defined for how the progress map handles the transition when a rubʿ crosses from one freshness state to another while being viewed? [Coverage, Gap]
- [ ] CHK034 - Are requirements defined for Poor revision on a dormant rubʿ in the 0-30 day window? [Coverage, Spec §Edge Cases]

## Edge Case Coverage

- [ ] CHK035 - Are requirements defined for a student at Level 240 (all rubʿ active) — is this an achievable end state? [Edge Case, Spec §FR-004]
- [ ] CHK036 - Are requirements defined for what happens when the certifying teacher's account is deactivated — does `certified_by` become NULL or cascade? [Edge Case, Gap]
- [ ] CHK037 - Are requirements defined for a rubʿ that goes dormant and is restored multiple times — does the dormancy timer reset each time? [Edge Case, Spec §FR-008]
- [ ] CHK038 - Are requirements specified for the decay interval when `review_count` is between defined thresholds (e.g., 4, which falls between 3 and 6-8)? [Edge Case, Spec §Edge Cases]
- [ ] CHK039 - Are requirements defined for the undo interaction when the app goes to background during the grace period? [Edge Case, Spec §FR-019]

## Non-Functional Requirements

- [ ] CHK040 - Are offline behavior requirements specified for certification/revision actions when the device loses connectivity? [Gap, Non-Functional]
- [ ] CHK041 - Are accessibility requirements defined for the progress map's color-coded freshness states (colorblind-safe alternatives)? [Gap, Non-Functional]
- [ ] CHK042 - Are i18n requirements specified for rubʿ-related terms, surah names, and number formatting in Arabic vs English? [Non-Functional, Spec §Assumptions]
- [ ] CHK043 - Are RTL layout requirements addressed for the juz-based progress map (expand direction, number positioning)? [Non-Functional, Gap]

## Dependencies & Assumptions

- [ ] CHK044 - Is the assumption "freshness is computed on read" validated against the dormancy write-back requirement (client must write `dormant_since` back to server)? [Assumption, Spec §Assumptions]
- [ ] CHK045 - Is the assumption "no production data exists" explicitly validated, and are migration rollback requirements excluded intentionally? [Assumption, Spec §Assumptions]
- [ ] CHK046 - Is the dependency on an external rubʿ verse boundary dataset documented with a specific source and fallback? [Dependency, Spec §Assumptions]
- [ ] CHK047 - Is the relationship between this feature and the existing memorization tracking system (migration 00009) documented — are they independent or overlapping? [Dependency, Gap]

## Ambiguities & Conflicts

- [ ] CHK048 - Does "dormant_since is updated when the system detects" conflict with the client-side computation model (who is "the system" — client or server)? [Ambiguity, Spec §Assumptions]
- [ ] CHK049 - Is there a conflict between FR-013 stating "5 tiers" and the existing sticker schema having 6 tiers (common, rare, epic, legendary, seasonal + the 4 "extra" stickers labeled as common)? [Conflict, Spec §FR-013]
- [ ] CHK050 - Is "re-certify as if it were new" in US-2 Scenario 6 unambiguous about whether it creates a new row or updates the existing certification record? [Ambiguity, Spec §US-2]

## Notes

- Check items off as completed: `[x]`
- Items marked `[Gap]` indicate missing requirements that should be added to the spec
- Items marked `[Ambiguity]` or `[Conflict]` should be resolved before implementation
- Items marked `[Clarity]` suggest the existing requirement needs sharper definition
- Reference the data model at `data-model.md` and contracts at `contracts/supabase-queries.md` for technical context
