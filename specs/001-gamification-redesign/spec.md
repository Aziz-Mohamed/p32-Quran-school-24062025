# Feature Specification: Gamification Redesign

**Feature Branch**: `001-gamification-redesign`
**Created**: 2026-02-20
**Status**: Draft
**Input**: User description: "Redesign gamification system based on memory-bank/gamification-redesign-v2.md — replace points/trophies/achievements with rubʿ-based levels (0-240) and stickers as social currency"

## Clarifications

### Session 2026-02-20

- Q: Can a teacher undo or delete a certification given by mistake? → A: Teacher can undo within a grace period (e.g., tap "Undo" within 30 seconds after certifying).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Teacher Certifies a Rubʿ (Priority: P1)

A teacher has just conducted a memorization session with a student (on Google Meet or in-person). The student successfully memorized a new rubʿ of the Quran. The teacher opens the app, navigates to the student's profile, and certifies the rubʿ as memorized. The student's level increases by one.

**Why this priority**: This is the core action that makes the entire level system work. Without certification, there are no levels.

**Independent Test**: Can be fully tested by a teacher opening a student's profile, tapping an uncertified rubʿ on the progress map, confirming certification, and verifying the student's level increases from N to N+1.

**Acceptance Scenarios**:

1. **Given** a teacher viewing a student's rubʿ progress map, **When** the teacher taps an uncertified rubʿ (gray with dashed border), **Then** a confirmation dialog appears showing the rubʿ number, juz, and hizb context.
2. **Given** the teacher confirms the certification dialog, **When** the certification is saved, **Then** the rubʿ changes to green (100% fresh), and the student's displayed level increases by 1.
3. **Given** a teacher viewing the progress map, **When** the teacher taps a rubʿ that is already certified (any color), **Then** the system does NOT show a certification dialog but instead shows revision options.
4. **Given** a student who is not in the teacher's class, **When** the teacher tries to access their profile, **Then** the teacher cannot see or certify rubʿ for that student.
5. **Given** the teacher just confirmed a certification, **When** the system shows a brief "Undo" option (within ~30 seconds), **Then** tapping "Undo" removes the certification and restores the rubʿ to uncertified state, decreasing the student's level by 1.
6. **Given** the teacher confirmed a certification more than 30 seconds ago, **When** the undo grace period has expired, **Then** the certification is permanent and no undo option is available.

---

### User Story 2 - Teacher Records a Rubʿ Revision (Priority: P1)

After a review session, the teacher records whether the student's revision of a previously certified rubʿ was "Good" or "Poor." This resets the rubʿ's freshness and affects the spaced repetition schedule.

**Why this priority**: Tied with certification as P1 — without revision recording, the decay system has no input and all rubʿ would eventually go dormant.

**Independent Test**: Can be fully tested by a teacher tapping a certified rubʿ, selecting "Good" or "Poor," and verifying freshness resets appropriately.

**Acceptance Scenarios**:

1. **Given** a teacher taps a certified rubʿ (green, yellow, orange, or red), **When** the revision options appear, **Then** the teacher sees exactly two choices: "Good" and "Poor."
2. **Given** the teacher selects "Good," **When** the revision is saved, **Then** the rubʿ freshness resets to 100% (green), the review count increases by 1, and the decay interval extends based on the new review count.
3. **Given** the teacher selects "Poor," **When** the revision is saved, **Then** the rubʿ freshness resets to 50% (orange), the review count stays unchanged, and the decay interval stays the same.
4. **Given** a rubʿ that went dormant less than 30 days ago, **When** the teacher marks a "Good" revision, **Then** the rubʿ is restored to active status and counts toward the student's level again.
5. **Given** a rubʿ that went dormant between 30 and 90 days ago, **When** the teacher marks a "Good" revision, **Then** the rubʿ is restored but the review count resets to 0 (spaced repetition restarts).
6. **Given** a rubʿ that has been dormant for 90+ days, **When** the teacher taps it, **Then** the system shows a "Re-certify" option instead of revision options. The teacher must re-certify it as if it were new.

---

### User Story 3 - Student Views Rubʿ Progress Map (Priority: P1)

A student opens the app and views their Quran memorization progress. They see a juz-based navigation showing all 30 juz, and can expand any juz to see the freshness state of its 8 rubʿ. They also see their current level prominently displayed.

**Why this priority**: The progress map is the student's primary view of their memorization journey. It provides motivation and awareness of what needs revision.

**Independent Test**: Can be fully tested by a student opening the progress map screen, verifying their level is displayed, expanding a juz to see rubʿ states, and confirming the freshness colors match expected decay calculations.

**Acceptance Scenarios**:

1. **Given** a student with 47 active rubʿ certified, **When** they open the progress map, **Then** they see "Level 47 / 240" with a progress bar showing 19.6%.
2. **Given** the progress map is displayed, **When** the student views the juz list, **Then** they see 30 juz rows, each showing the juz number, completion count (e.g., "5/8 rubʿ"), and a mini progress bar.
3. **Given** a juz row is displayed, **When** the student taps it, **Then** it expands to show 8 rubʿ blocks with color-coded freshness states (green, yellow, orange, red, gray, or dashed-gray for uncertified).
4. **Given** a student views the progress map, **When** they see it, **Then** it is read-only — no certification or revision actions are available.
5. **Given** some rubʿ are approaching dormancy (red state), **When** the student views the map, **Then** they can see a count of rubʿ needing revision (e.g., "3 rubʿ need revision").

---

### User Story 4 - Freshness Decays Over Time (Priority: P2)

A student's certified rubʿ naturally lose freshness over time when not revised. The decay rate depends on how many times the rubʿ has been successfully reviewed (spaced repetition). When freshness reaches 0%, the rubʿ goes dormant and the student's level drops.

**Why this priority**: The decay mechanic is what makes the level system honest and creates ongoing engagement. Without it, levels would be permanent and meaningless.

**Independent Test**: Can be tested by certifying a rubʿ, advancing time (or using test data with past timestamps), and verifying the freshness percentage and color change appropriately. Level should decrease when a rubʿ goes dormant.

**Acceptance Scenarios**:

1. **Given** a newly certified rubʿ with 0 previous reviews, **When** 14 days pass without revision, **Then** the rubʿ becomes dormant (0% freshness, gray) and the student's level decreases by 1.
2. **Given** a rubʿ with 3 successful reviews (45-day interval), **When** 11 days pass, **Then** freshness is approximately 75% (yellow state).
3. **Given** a rubʿ with 3 successful reviews, **When** 45 days pass without revision, **Then** the rubʿ becomes dormant.
4. **Given** a rubʿ with 12+ successful reviews, **When** 120 days pass without revision, **Then** the rubʿ becomes dormant.
5. **Given** a student at Level 47 with one rubʿ going dormant, **When** the dormancy occurs, **Then** the student's level updates to 46.
6. **Given** a school break period, **When** the break period elapses, **Then** decay continues normally — no pausing.

---

### User Story 5 - Remove Old Gamification System (Priority: P2)

The old gamification system (trophies, achievements, point-based levels, trophy-tier stickers) is removed. The Trophy Room screen is replaced by the Rubʿ Progress Map. Sticker points no longer affect levels — they only drive the leaderboard.

**Why this priority**: Must be done alongside the new system to avoid confusing overlap between old and new concepts.

**Independent Test**: Can be tested by verifying the Trophy Room route is gone, trophy/achievement data is inaccessible, the 10 trophy-tier stickers are removed from the catalog, and sticker awards no longer change the student's level.

**Acceptance Scenarios**:

1. **Given** a student navigating the app, **When** they look for the Trophy Room, **Then** it no longer exists; the navigation leads to the Rubʿ Progress Map instead.
2. **Given** a teacher awards a sticker to a student, **When** the sticker is saved, **Then** the student's sticker points increase (for leaderboard) but the student's level does NOT change.
3. **Given** the sticker catalog, **When** a user views available stickers, **Then** only 39 stickers are shown (the 10 trophy-tier stickers are gone).
4. **Given** any user in the app, **When** they navigate any screen, **Then** there is no mention of trophies or achievements anywhere.

---

### User Story 6 - Student Dashboard Shows Level (Priority: P3)

The student's dashboard prominently displays their current level as a rubʿ count (e.g., "Level 47 / 240") with a progress bar. It also shows a warning count for rubʿ approaching dormancy.

**Why this priority**: Dashboard integration is important for visibility but depends on the core level system being in place first.

**Independent Test**: Can be tested by a student opening the dashboard and verifying their level, progress bar, and revision warning count are displayed accurately.

**Acceptance Scenarios**:

1. **Given** a student with 47 active rubʿ, **When** they open the dashboard, **Then** they see "Level 47 / 240" and a progress bar at ~19.6%.
2. **Given** a student with 3 rubʿ in red/critical state, **When** they open the dashboard, **Then** they see a warning like "3 rubʿ need revision."
3. **Given** a student with 0 certified rubʿ, **When** they open the dashboard, **Then** they see "Level 0 / 240" with an empty progress bar.

---

### Edge Cases

- What happens when a teacher tries to certify a rubʿ that is already certified and active? The system shows revision options, not re-certification.
- What happens when a rubʿ goes dormant and the teacher marks a "Poor" revision? A poor revision does NOT restore a dormant rubʿ — only a "Good" revision or re-certification (for 90+ day dormancy) can restore it.
- What happens if a student's last active rubʿ goes dormant? Their level drops to 0. The progress map shows all previously certified rubʿ in gray (dormant) state.
- What happens when multiple rubʿ go dormant simultaneously (e.g., after a long absence)? Level drops by the total count of newly dormant rubʿ. Each rubʿ is processed independently.
- What happens when the decay interval calculation falls between defined thresholds in the review_count table? The system uses the interval for the highest matching review count threshold (e.g., review_count of 4 uses the threshold for 3, which is 45 days).
- What happens when a teacher is reassigned to a different class? They lose certification/revision access for students no longer in their class.
- What happens when a teacher certifies the wrong rubʿ by mistake? The system shows an "Undo" option for ~30 seconds after certification. After the grace period expires, the certification is permanent.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow teachers to certify individual rubʿ for students in their class, recording which teacher certified it and when.
- **FR-002**: System MUST allow teachers to record revisions for certified rubʿ, with exactly two quality options: "Good" and "Poor."
- **FR-003**: System MUST compute each certified rubʿ's freshness as a percentage (0-100%) based on time elapsed since last revision and the spaced repetition decay interval.
- **FR-004**: System MUST calculate a student's level as the count of certified rubʿ that are currently active (freshness > 0%).
- **FR-005**: System MUST apply the spaced repetition decay model where more successful reviews result in longer intervals before dormancy (14 days for 0 reviews, up to 120 days for 12+ reviews).
- **FR-006**: A "Good" revision MUST reset freshness to 100%, increment review count by 1, and extend the decay interval per the spaced repetition table.
- **FR-007**: A "Poor" revision MUST reset freshness to 50%, leave review count unchanged, and keep the decay interval the same.
- **FR-008**: System MUST support tiered dormant recovery: 0-30 days dormant requires a good revision; 30-90 days dormant requires a good revision but resets review count to 0; 90+ days dormant requires full re-certification by teacher.
- **FR-009**: System MUST display a rubʿ progress map organized by juz (30 juz rows, each expandable to 8 rubʿ), with color-coded freshness states per rubʿ.
- **FR-010**: The progress map MUST be interactive for teachers (tap to certify/revise) and read-only for students.
- **FR-011**: System MUST store a static reference of all 240 rubʿ with their verse boundaries (juz, hizb, quarter, start surah/ayah, end surah/ayah).
- **FR-012**: System MUST remove all trophy and achievement functionality — tables, screens, notification preferences, and related code.
- **FR-013**: System MUST remove the 10 trophy-tier stickers from the sticker catalog, leaving 39 stickers across 5 tiers.
- **FR-014**: Sticker points MUST only affect leaderboard ranking, NOT the student's level.
- **FR-015**: The student's level MUST be displayed on their dashboard with a progress bar (level / 240) and a count of rubʿ needing revision.
- **FR-016**: Decay MUST run continuously with no pause mechanism for school breaks or vacations.
- **FR-017**: System MUST enforce that only teachers assigned to a student's class (or admins) can certify or record revisions for that student.
- **FR-018**: Each student can have at most one certification record per rubʿ (uniqueness enforced).
- **FR-019**: System MUST provide a brief undo grace period (~30 seconds) after a teacher certifies a rubʿ, allowing the teacher to reverse an accidental certification. After the grace period, the certification is permanent.

### Key Entities

- **Rubʿ Reference**: A fixed Quran structural unit (1 of 240 quarters). Defined by juz number, hizb number, quarter position, start/end surah and ayah. Static data — never changes.
- **Rubʿ Certification**: A student's mastery record for a specific rubʿ. Tracks which teacher certified it, when, how many successful revisions have occurred, when it was last reviewed, and whether it has gone dormant.
- **Student (modified)**: Existing entity. Level is now computed as count of active (non-dormant) certifications rather than derived from sticker points.
- **Sticker (modified)**: Existing entity. Trophy tier removed. Points now only affect leaderboard, not levels.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Teachers can certify a rubʿ for a student in under 10 seconds (open profile → tap rubʿ → confirm).
- **SC-002**: Teachers can record a revision (Good/Poor) in under 5 seconds (tap rubʿ → select quality).
- **SC-003**: Students can view their full 30-juz progress map and identify which rubʿ need revision in under 15 seconds.
- **SC-004**: The student's displayed level always matches the actual count of active (non-dormant) certified rubʿ — zero discrepancy.
- **SC-005**: Freshness calculations are consistent — the displayed freshness percentage matches the expected value based on the spaced repetition decay model with no more than 1% rounding deviation.
- **SC-006**: 100% of old gamification elements (trophies, achievements, trophy-tier stickers, Trophy Room screen) are removed with no leftover references in the app.
- **SC-007**: Sticker awards have zero effect on the student's level — only leaderboard points are affected.
- **SC-008**: The app's gamification concepts are reduced from 5 (points, levels, stickers, trophies, achievements) to 2 (levels, stickers), verified by user-facing screens containing no mention of trophies or achievements.

## Assumptions

- No production data exists — the system can be rebuilt from scratch without migration concerns for existing users.
- Rubʿ verse boundaries are well-established Islamic reference data that can be sourced from standard Quran metadata databases.
- Teaching happens outside the app (Google Meet / in-person) — all teacher actions in the app are recording/management, not live session tracking.
- Freshness is computed on read (not via background jobs) — the client calculates freshness from stored timestamps and the decay model. The dormant_since field is updated when the system detects a rubʿ has crossed the dormancy threshold.
- Notifications for fading rubʿ are a future enhancement — not in scope for this feature's initial delivery.
- Parent and admin views of rubʿ progress follow existing role-based patterns (parents see children, admins see school) and will use the same progress map component in read-only mode.
- Bulk certification (certifying multiple rubʿ at once) is not in scope for the initial delivery.
