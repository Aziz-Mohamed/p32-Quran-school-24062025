# Decision Log — Quran School

> Record of key technical and product decisions. Update as new decisions are made.

| # | Date | Decision | Chosen | Over | Why |
|---|------|----------|--------|------|-----|
| 1 | 2026-02-07 | Mobile framework | Expo React Native (SDK 54) | Flutter, Native | Cross-platform, JS ecosystem, rapid delivery via EAS, OTA updates, large community |
| 2 | 2026-02-07 | Backend | Supabase | Firebase, custom API | Self-hostable (privacy-first), PostgreSQL, built-in auth + RLS, auto-generated TS types |
| 3 | 2026-02-07 | Routing | Expo Router v6 (file-based) | React Navigation (manual) | Convention over config, colocated layouts, URL-based deep linking |
| 4 | 2026-02-07 | Server state | TanStack Query v5 | SWR, manual fetch | Caching, retries, loading/error states, optimistic updates, devtools |
| 5 | 2026-02-07 | Client state | Zustand v5 | Redux, Context-only | Minimal boilerplate, no providers needed, TypeScript-native, tiny bundle |
| 6 | 2026-02-07 | Forms | react-hook-form + zod | Formik + Yup | Uncontrolled inputs (better perf), zod = TypeScript-native validation schemas |
| 7 | 2026-02-07 | Multi-tenant | school_id on all tables from day 1 | Single-tenant MVP | Vital for multi-school support, avoids painful data migration later |
| 8 | 2026-02-07 | MVP scope | All 4 roles fully functional | Admin-only first | Multi-tenant requires all roles; the 4-role ecosystem IS the product |
| 9 | 2026-02-07 | Codebase | Delete existing, start fresh | Iterate on current code | Old code uses outdated patterns, no Supabase, no multi-tenant, mock data only |
| 10 | 2026-02-07 | Analytics | Simple stats in MVP | Defer entirely to Phase 2 | Admin needs basic school health metrics from day 1 for operational decisions |
| 11 | 2026-02-07 | Out of scope (MVP) | No push notif, payments, chat, web admin | Include some | Token/scope efficiency; each can be added independently in Phase 2-3 |
| 12 | 2026-02-07 | Animation | react-native-reanimated only | Lottie, Rive | "Smooth not showy" philosophy — no heavy animation packs, fast load times |
| 13 | 2026-02-07 | Dark mode | Phase 2 | Include in MVP | Reduces scope; light mode is sufficient for launch |
| 14 | 2026-02-07 | Lists | @shopify/flash-list | FlatList | Required for performance with large student/session lists; view recycling |
