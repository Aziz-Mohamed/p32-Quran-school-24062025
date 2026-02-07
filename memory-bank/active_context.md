# Active Context — Quran School

## Current Task

Memory-bank source of truth setup complete. Ready to begin Phase 1.

## Recent Changes

- Created memory-bank structure: vision.md, prd.md, tasks.md, active_context.md, architecture.md, decisions.md
- Decision: Start fresh — existing codebase will be deleted and rebuilt from scratch
- Decision: Full multi-tenant (school_id on all tables) from day 1
- PRD updated: Expo SDK 54, Router v6, multi-tenant schema, school-scoped RLS, out-of-scope section added

## Next Step

**Phase 1, Task 1**: Initialize fresh Expo project with SDK 54, TypeScript, Expo Router v6. Delete existing app code and scaffold the new project structure per PRD section 4.

## Blockers

None

## Working Decisions

- All 4 roles fully functional in MVP (Admin + Teacher + Student + Parent)
- Light mode only for MVP (dark mode = Phase 2)
- Simple analytics in MVP (admin dashboard stats, basic charts)
- No push notifications, payments, real-time chat, or web admin in MVP
- Existing codebase will be deleted — fresh start
