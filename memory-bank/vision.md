# Vision — Quran School App

## Mission

A **delightful** Quran learning management companion that children enjoy using, teachers find efficient, parents trust for transparency, and admins rely on for school operations. This app does **not** contain the Quran — it manages the ecosystem around Quran recitation learning.

## Who It's For

| Role | Purpose |
|------|---------|
| **Student** | Learn, track progress, collect stickers/trophies, compete on leaderboard |
| **Teacher** | Log sessions, evaluate recitation, award stickers, monitor class |
| **Parent** | Monitor children's progress, attendance, class standing |
| **Admin** | Manage students/teachers/classes, bulk attendance, school analytics |

## Design Mantra

> **"Intuitive, simple, smooth — never in the way."**

- Zero learning curve for all user roles
- Smooth micro-interactions, not showy animations
- Every screen serves one clear purpose

## Non-Negotiables

1. **Bilingual (EN/AR) with full RTL/LTR** — logical CSS only, no `left`/`right`
2. **Multi-tenant from day 1** — `school_id` on every table, RLS per-school
3. **Privacy-first** — Supabase (self-hostable), no third-party trackers
4. **TypeScript strict** — no `any` types, ever
5. **All text through i18n** — no hardcoded strings in components
6. **Smooth, not showy** — `react-native-reanimated` only, no Lottie/Rive packs
7. **Accessibility** — WCAG 2.1 AA contrast, 44x44px touch targets minimum
8. **Performance** — FlashList for lists, expo-image for images, skeleton loaders over spinners

## Secret Sauce

The 4-role ecosystem unified through **gamified Quran memorization tracking**:

- Teachers log sessions with recitation/tajweed/memorization scores
- Scores generate points, points unlock levels (Beginner -> Quran Guardian)
- Teachers award stickers manually; trophies auto-unlock at milestones
- Students compete on class leaderboards (weekly + all-time)
- Parents see everything transparently — no information asymmetry
- Admins have full operational control across multiple schools

This creates a **virtuous cycle**: Teacher evaluates -> Student earns -> Parent sees -> Student is motivated -> Teacher evaluates again.
