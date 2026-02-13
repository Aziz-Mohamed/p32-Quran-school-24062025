# Pre-Implementation Checklist: Push Notifications

**Purpose**: Validate security, integration, and UX requirements quality before implementation begins
**Created**: 2026-02-13
**Feature**: [spec.md](../spec.md) | [plan.md](../plan.md)
**Focus**: Security, Integration, UX
**Depth**: Standard
**Audience**: Author (self-review)

## Security — Requirement Completeness

- [ ] CHK001 - Are RLS policies specified for both new tables (`push_tokens`, `notification_preferences`)? [Completeness, Data Model §push_tokens]
- [ ] CHK002 - Are access control requirements defined for who can read/write push tokens (own user only vs. service role)? [Completeness, Spec §FR-001]
- [ ] CHK003 - Is the `EXPO_ACCESS_TOKEN` secret management approach documented (how stored, who has access, rotation policy)? [Gap, Plan §Environment Variables]
- [ ] CHK004 - Are requirements specified for preventing notification content from leaking sensitive student data (e.g., grades, attendance status visible on lock screen)? [Gap]
- [ ] CHK005 - Is the service role key usage in Edge Functions documented with scope limitations (which tables it accesses)? [Completeness, Contracts §send-notification]
- [ ] CHK006 - Are requirements defined for preventing unauthorized token registration (e.g., user A registering a token for user B)? [Gap]
- [ ] CHK007 - Does the spec define what happens to push tokens when a user's account is deactivated or deleted? [Edge Case, Spec §Edge Cases]
- [ ] CHK008 - Are data retention requirements specified for push tokens (how long inactive tokens are kept before hard deletion)? [Gap]

## Security — Requirement Clarity

- [ ] CHK009 - Is "token cleanup on logout" clearly defined — does it mean deletion or marking `is_active = false`? [Ambiguity, Spec §FR-002]
- [ ] CHK010 - Is the webhook authentication mechanism specified (how the Edge Function validates that the request came from a legitimate database webhook, not an external caller)? [Clarity, Contracts §send-notification]

## Integration — Requirement Completeness

- [ ] CHK011 - Are all 6 database webhook triggers explicitly listed with their source tables and events? [Completeness, Data Model §Category-to-Table Mapping]
- [ ] CHK012 - Are Expo Push API rate limits (600/sec, 100/batch) documented as constraints that the Edge Function must respect? [Completeness, Research §2]
- [ ] CHK013 - Are requirements specified for what happens when the Expo Push API returns `MessageRateExceeded`? [Gap, Spec §FR-009]
- [ ] CHK014 - Is the pg_cron schedule for homework reminders and teacher summaries specified with exact cron expressions? [Completeness, Contracts §homework-reminder]
- [ ] CHK015 - Are requirements defined for the database webhook timeout (default 1000ms) and what happens if the Edge Function exceeds it? [Gap]
- [ ] CHK016 - Are Expo Push API receipt checking requirements defined (when to check, what to do with results)? [Gap, Research §2]
- [ ] CHK017 - Is the `pg_net` extension enablement documented as a prerequisite in the migration plan? [Gap, Plan §data-model]
- [ ] CHK018 - Are requirements defined for Edge Function cold start latency and its impact on the 10-second delivery target? [Gap, Spec §SC-001]

## Integration — Requirement Consistency

- [ ] CHK019 - Is the retry strategy consistent between spec (FR-009: "3 retries with exponential backoff") and the fire-and-forget model (no persistent queue for retries across function invocations)? [Conflict, Spec §FR-009 vs. Clarifications]
- [ ] CHK020 - Are the notification categories in FR-003 (9 types) consistent with the preference columns in the data model (9 boolean columns)? [Consistency, Spec §FR-003 vs. Data Model §notification_preferences]
- [ ] CHK021 - Is the 30-second batching window (FR-008) consistent with the database webhook trigger model (each INSERT fires independently)? [Conflict, Spec §FR-008 vs. Plan §Event-Driven]

## Integration — Scenario Coverage

- [ ] CHK022 - Are requirements defined for the scenario where a school has no timezone configured (NULL or default 'UTC')? [Coverage, Edge Case]
- [ ] CHK023 - Are requirements specified for handling concurrent webhook fires (e.g., bulk attendance marking triggers 30 webhooks simultaneously)? [Coverage, Edge Case]
- [ ] CHK024 - Are requirements defined for what happens when the Edge Function fails to connect to Supabase DB (to look up tokens/preferences)? [Coverage, Exception Flow]
- [ ] CHK025 - Are requirements specified for the first-time user scenario where `notification_preferences` row doesn't exist yet? [Coverage, Edge Case]

## UX — Requirement Completeness

- [ ] CHK026 - Are the soft-ask screen's visual requirements specified (layout, copy, illustrations, role-specific messaging)? [Completeness, Spec §FR-014]
- [ ] CHK027 - Is the in-app banner component specified with display duration, dismissal behavior, and tap action? [Completeness, Spec §FR-007]
- [ ] CHK028 - Are notification preferences screen requirements defined for each role (which toggles appear for student vs. teacher vs. parent)? [Completeness, Spec §FR-012]
- [ ] CHK029 - Is the quiet hours UI specified (time picker format, timezone display, validation for start < end or overnight spans)? [Completeness, Spec §US5]
- [ ] CHK030 - Are requirements defined for what the preferences screen shows when notifications are disabled at the OS level? [Gap]
- [ ] CHK031 - Are requirements specified for the notification preferences screen entry point (where in settings/profile it appears for each role)? [Gap, Spec §FR-012]

## UX — Requirement Clarity

- [ ] CHK032 - Is "soft-ask is not shown again until the user navigates to notification preferences" clearly defined — what resets the soft-ask state? [Ambiguity, Spec §FR-014]
- [ ] CHK033 - Can "single grouped notification" for multiple homework items (US3, scenario 4) be objectively defined — what does the grouped notification body look like? [Clarity, Spec §US3]
- [ ] CHK034 - Is the deep-link fallback behavior ("show relevant list screen") specified per notification category? [Clarity, Spec §FR-006]

## UX — Scenario Coverage

- [ ] CHK035 - Are requirements defined for the scenario where a user has notifications enabled but no push token (e.g., simulator/Expo Go)? [Coverage, Edge Case]
- [ ] CHK036 - Are localization requirements specified for notification title and body templates in both EN and AR? [Coverage, Spec §FR-013]
- [ ] CHK037 - Are requirements defined for notification sound and badge behavior per category? [Gap]
- [ ] CHK038 - Are requirements specified for what happens when a parent has children in different schools (multi-tenant edge case)? [Coverage, Edge Case]

## Dependencies & Assumptions

- [ ] CHK039 - Is the assumption that "Development Build is required" documented as a user-facing constraint (users must migrate from Expo Go)? [Assumption, Research §1]
- [ ] CHK040 - Is the dependency on `pg_cron` and `pg_net` extensions being enabled on the Supabase project documented? [Dependency, Research §4]
- [ ] CHK041 - Is the assumption that Edge Functions are already deployed for auth (`create-school`, `create-member`) validated — does the deployment pipeline exist? [Assumption, Plan §Structure]

## Notes

- Items are ordered by risk within each section (higher-risk items first)
- Check items off as requirements are clarified or gaps are addressed in the spec
- CHK019 and CHK021 flag potential consistency issues that should be resolved before implementation
- This checklist complements `requirements.md` which covers general spec quality
