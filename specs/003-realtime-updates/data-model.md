# Data Model: Realtime Updates

**Feature**: 003-realtime-updates
**Date**: 2026-02-13

## Overview

This feature introduces **no new database tables**. It adds a client-side subscription layer over existing tables. The "data model" here describes the subscription configuration entities that exist in application code.

## Subscribed Tables (Existing)

No schema changes required. The following existing tables are subscribed to via Supabase Realtime `postgres_changes`:

| Table | Events | Has `school_id` | Filter Strategy |
|-------|--------|-----------------|-----------------|
| `student_stickers` | INSERT | No (inherited via FK) | `student_id` for student/parent; RLS for teacher/admin |
| `attendance` | INSERT, UPDATE | Yes | `student_id` for student/parent; `school_id` for admin; RLS for teacher |
| `sessions` | INSERT | Yes | `student_id` for student; `school_id` for teacher/admin; `student_id=in.(...)` for parent |
| `students` | UPDATE | Yes | `id` for student; `class_id=in.(...)` for teacher; `id=in.(...)` for parent; `school_id` for admin |
| `homework` | INSERT, UPDATE | Yes | `student_id` for student/parent |
| `student_trophies` | INSERT | No (inherited via FK) | `student_id` for student |
| `student_achievements` | INSERT | No (inherited via FK) | `student_id` for student |
| `classes` | INSERT, UPDATE | Yes | `teacher_id` for teacher; `school_id` for admin |

## Application-Level Entities

### SubscriptionConfig

Defines a single table subscription within a channel.

```
SubscriptionConfig {
  table: string                          # Database table name
  event: 'INSERT' | 'UPDATE' | '*'       # Which events to listen for
  filter?: string                        # Supabase filter string (e.g., 'student_id=eq.abc')
  queryKeys: string[][]                  # TanStack Query keys to invalidate
}
```

### RoleSubscriptionProfile

Defines the complete subscription configuration for a role.

```
RoleSubscriptionProfile {
  role: 'student' | 'teacher' | 'parent' | 'admin'
  channelName: string                    # Unique channel identifier
  subscriptions: SubscriptionConfig[]    # Array of table subscriptions
  debounceMs: number                     # Debounce window for event coalescing
}
```

### MutationTracker

In-memory deduplication tracker for local mutations.

```
MutationTracker {
  entries: Map<string, number>           # Key: 'table:recordId', Value: timestamp (ms)
  maxAgeMs: number                       # Entries older than this are pruned (5000ms)
  dedupeWindowMs: number                 # Events within this window of a local mutation are skipped (2000ms)
}
```

## Subscription Profiles by Role

### Student

Channel name: `student-{studentId}`

| Table | Event | Filter | Query Keys Invalidated |
|-------|-------|--------|----------------------|
| `student_stickers` | INSERT | `student_id=eq.{studentId}` | `student-stickers`, `student-dashboard`, `leaderboard` |
| `attendance` | INSERT, UPDATE | `student_id=eq.{studentId}` | `attendance`, `attendance-calendar`, `attendance-rate`, `student-dashboard` |
| `sessions` | INSERT | `student_id=eq.{studentId}` | `sessions`, `student-dashboard` |
| `students` | UPDATE | `id=eq.{studentId}` | `students`, `student-dashboard`, `leaderboard` |
| `homework` | INSERT, UPDATE | `student_id=eq.{studentId}` | `homework`, `student-dashboard` |
| `student_trophies` | INSERT | `student_id=eq.{studentId}` | `student-trophies`, `student-dashboard` |
| `student_achievements` | INSERT | `student_id=eq.{studentId}` | `student-achievements`, `student-dashboard` |

Debounce: 300ms

### Teacher

Channel name: `teacher-{teacherId}`

| Table | Event | Filter | Query Keys Invalidated |
|-------|-------|--------|----------------------|
| `students` | UPDATE | `class_id=in.({classIds})` | `students`, `leaderboard`, `top-performers`, `needs-support`, `teacher-dashboard` |
| `sessions` | INSERT | `school_id=eq.{schoolId}` | `sessions`, `teacher-dashboard` |
| `student_stickers` | INSERT | `school_id=eq.{schoolId}` | `student-stickers`, `teacher-dashboard` |
| `attendance` | INSERT, UPDATE | `school_id=eq.{schoolId}` | `attendance`, `class-attendance`, `teacher-dashboard` |
| `classes` | UPDATE | `teacher_id=eq.{teacherId}` | `classes`, `teacher-dashboard` |

Debounce: 500ms

Note: `student_stickers` has no `school_id` column. For teacher subscriptions, the filter uses RLS enforcement (events for rows the teacher can't SELECT are dropped). An unfiltered subscription on `student_stickers` is acceptable because RLS limits delivery to the teacher's school scope.

### Parent

Channel name: `parent-{parentId}`

| Table | Event | Filter | Query Keys Invalidated |
|-------|-------|--------|----------------------|
| `attendance` | INSERT, UPDATE | `student_id=in.({childIds})` | `attendance`, `attendance-calendar`, `attendance-rate`, `parent-dashboard` |
| `sessions` | INSERT | `student_id=in.({childIds})` | `sessions`, `parent-dashboard`, `child-detail` |
| `student_stickers` | INSERT | `student_id=in.({childIds})` | `student-stickers`, `parent-dashboard`, `child-detail` |
| `students` | UPDATE | `id=in.({childIds})` | `students`, `children`, `child-detail`, `parent-dashboard` |
| `homework` | INSERT, UPDATE | `student_id=in.({childIds})` | `homework`, `parent-dashboard` |

Debounce: 500ms

### Admin

Channel name: `admin-{schoolId}`

| Table | Event | Filter | Query Keys Invalidated |
|-------|-------|--------|----------------------|
| `students` | INSERT, UPDATE | `school_id=eq.{schoolId}` | `students`, `admin-dashboard` |
| `sessions` | INSERT | `school_id=eq.{schoolId}` | `sessions`, `admin-dashboard` |
| `attendance` | INSERT, UPDATE | `school_id=eq.{schoolId}` | `attendance`, `class-attendance`, `admin-dashboard` |
| `student_stickers` | INSERT | No direct filter (RLS) | `student-stickers`, `admin-dashboard` |
| `classes` | INSERT, UPDATE | `school_id=eq.{schoolId}` | `classes`, `admin-dashboard` |

Debounce: 500ms

## State Transitions

### Channel Lifecycle

```
IDLE → SUBSCRIBING → SUBSCRIBED → (active)
                                      ↓
                                  CHANNEL_ERROR → (auto-reconnect) → SUBSCRIBING
                                      ↓
                                  TIMED_OUT → (auto-reconnect) → SUBSCRIBING
                                      ↓
                                  CLOSED (app logout or cleanup)
```

### App Lifecycle Integration

```
App Active + Authenticated → Channel SUBSCRIBED (normal operation)
App Backgrounded → Channel may disconnect (OS behavior)
App Foregrounded → Check channel status → Re-subscribe if needed → Refetch stale queries
User Logout → removeAllChannels() → CLOSED
User Login → Create new channel → SUBSCRIBING → SUBSCRIBED
```
