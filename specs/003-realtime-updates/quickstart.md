# Quickstart: Realtime Updates

**Feature**: 003-realtime-updates
**Branch**: `003-realtime-updates`

## Prerequisites

- Existing Quran School app on `001-mvp-phase1` branch (fully implemented)
- Supabase project `zngiszdfdowjvwxqmexl` with all tables and RLS policies
- No additional Supabase configuration needed (Realtime is enabled by default on all public schema tables)
- Install `expo-network`: `npx expo install expo-network` (required for `onlineManager` network detection)

## What This Feature Adds

A client-side subscription layer using Supabase Realtime `postgres_changes` that automatically invalidates TanStack Query cache when data changes. No new database tables, no new API endpoints, no Edge Functions.

## New Files

```
src/features/realtime/
├── hooks/
│   ├── useRealtimeSubscription.ts   # Core: channel setup + debounce + dedup + cleanup
│   ├── useRealtimeManager.ts        # Orchestrator: reads auth, builds profile, delegates
│   └── useRealtimeReconnect.ts      # App lifecycle: foreground reconnection
├── config/
│   ├── subscription-profiles.ts     # Role-specific subscription configurations
│   └── event-query-map.ts           # Table event → query key invalidation mapping
├── utils/
│   ├── mutation-tracker.ts          # Deduplication tracker for local mutations
│   └── debounce.ts                  # Debounced invalidation utility
├── types/
│   └── realtime.types.ts            # TypeScript interfaces
└── index.ts                         # Barrel export
```

## Modified Files

```
app/_layout.tsx                      # Add useRealtimeManager + useRealtimeReconnect + focusManager + onlineManager
src/lib/queryClient.ts               # (verify singleton usage — fix if _layout.tsx has separate instance)
src/features/*/hooks/use*.ts         # Add mutationTracker.record() calls in onSuccess handlers
```

## Implementation Order

1. **Types & config** — Define interfaces + subscription profiles + event-query map
2. **Mutation tracker** — Simple Map-based dedup utility
3. **Core subscription hook** — `useRealtimeSubscription` with debounce + dedup + cleanup
4. **Role profile builders** — `buildStudentProfile`, `buildTeacherProfile`, etc.
5. **Manager hook** — `useRealtimeManager` that reads auth context and wires everything
6. **Reconnect hook** — `useRealtimeReconnect` with AppState + focusManager + onlineManager
7. **Wire into app** — Add hooks to `_layout.tsx`
8. **Add mutation tracking** — Update existing mutation hooks with `mutationTracker.record()`
9. **Test** — Two-device testing for each user story

## Key Patterns

### Channel setup (conceptual)
```typescript
const channel = supabase
  .channel(channelName)
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'student_stickers', filter }, handler)
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sessions', filter }, handler)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance', filter }, handler)
  .subscribe()
```

### Invalidation on event (conceptual)
```typescript
// Inside event handler (debounced):
const queryKeys = eventQueryMap.getQueryKeys(table, payload)
for (const key of queryKeys) {
  queryClient.invalidateQueries({ queryKey: key })
}
```

### Dedup check (conceptual)
```typescript
// In event handler, before invalidation:
if (mutationTracker.isDuplicate(table, payload.new?.id)) return
```

## Testing Checklist

- [ ] Award sticker (teacher) → student dashboard updates (two devices)
- [ ] Mark attendance (admin) → parent calendar updates (two devices)
- [ ] Log session (teacher) → student session history updates
- [ ] Change class assignment (admin) → teacher student list updates
- [ ] Backgrounding and foregrounding → data refetches correctly
- [ ] Logout → no orphan subscriptions
- [ ] Network disconnect → reconnect → data catches up
- [ ] Rapid events (20 attendance marks) → single refetch, no flicker

## No Database Changes

This feature is entirely client-side. No migrations, no new tables, no RPC functions. The existing RLS policies on all tables automatically scope realtime event delivery per-user.
