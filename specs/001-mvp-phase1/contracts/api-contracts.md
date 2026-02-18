# API Contracts: Quran School MVP (Phase 1)

**Feature**: `001-mvp-phase1` | **Date**: 2026-02-08

## Overview

All data access uses the Supabase JS SDK directly (no REST API layer). Edge Functions handle operations requiring the `service_role` key. This document defines the service layer contracts organized by feature module.

---

## 1. Edge Functions (Server-Side)

### EF-001: `create-school`

Creates a new school and its admin user. Public endpoint (no JWT required).

```typescript
// POST /functions/v1/create-school
// Headers: { "Content-Type": "application/json" }

// Request
interface CreateSchoolRequest {
  schoolName: string;       // 2-100 chars
  adminFullName: string;    // 2-100 chars
  username: string;         // 3-30 chars, lowercase alphanumeric + underscore
  password: string;         // 6+ chars
}

// Response (200)
interface CreateSchoolResponse {
  school: {
    id: string;
    name: string;
    slug: string;
  };
  session: {
    access_token: string;
    refresh_token: string;
  };
  profile: {
    id: string;
    username: string;
    role: 'admin';
    full_name: string;
  };
}

// Error (400)
interface ErrorResponse {
  error: string;            // Human-readable message
  code: string;             // Machine-readable code
}
```

**Internal flow**:
1. Validate inputs (zod)
2. Generate slug: `schoolName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')`
3. Check slug uniqueness, append number if collision
4. Build synthetic email: `${username}@${slug}.app`
5. `supabaseAdmin.auth.admin.createUser({ email, password, user_metadata: { school_id, role: 'admin', full_name, username } })`
6. Insert school record with `owner_id = user.id`
7. Return session + profile

**Error codes**: `SCHOOL_NAME_REQUIRED`, `USERNAME_TAKEN`, `SLUG_COLLISION`, `WEAK_PASSWORD`

---

### EF-002: `create-member`

Admin creates a new user (student, teacher, or parent). Requires admin JWT.

```typescript
// POST /functions/v1/create-member
// Headers: { "Authorization": "Bearer <jwt>", "Content-Type": "application/json" }

// Request
interface CreateMemberRequest {
  fullName: string;
  username: string;
  password: string;
  role: 'student' | 'teacher' | 'parent';
  // Student-specific (optional)
  classId?: string;
  parentId?: string;
  dateOfBirth?: string;     // ISO date
}

// Response (200)
interface CreateMemberResponse {
  profile: {
    id: string;
    username: string;
    role: string;
    full_name: string;
    school_id: string;
  };
  // If role is 'student', also includes:
  student?: {
    id: string;
    class_id: string | null;
    parent_id: string | null;
    current_level: number;
    total_points: number;
  };
}
```

**Internal flow**:
1. Extract caller's `school_id` from JWT claims (via profile lookup)
2. Verify caller role is `admin`
3. Fetch school slug
4. Build synthetic email: `${username}@${slug}.app`
5. Check username uniqueness within school
6. `supabaseAdmin.auth.admin.createUser({ email, password, user_metadata })`
7. Profile created by trigger; Edge Function creates `students` row if role is student
8. Return profile + optional student record

**Error codes**: `UNAUTHORIZED`, `USERNAME_TAKEN`, `INVALID_ROLE`, `CLASS_NOT_FOUND`, `CLASS_FULL`

---

### EF-003: `reset-member-password`

Admin resets another user's password. Requires admin JWT.

```typescript
// POST /functions/v1/reset-member-password
// Headers: { "Authorization": "Bearer <jwt>", "Content-Type": "application/json" }

// Request
interface ResetPasswordRequest {
  userId: string;           // Target user's profile ID
  newPassword: string;      // 6+ chars
}

// Response (200)
interface ResetPasswordResponse {
  success: true;
}
```

**Internal flow**:
1. Verify caller is admin
2. Verify target user belongs to same school
3. `supabaseAdmin.auth.admin.updateUserById(userId, { password: newPassword })`

**Error codes**: `UNAUTHORIZED`, `USER_NOT_FOUND`, `CROSS_SCHOOL_ACCESS`, `WEAK_PASSWORD`

---

## 2. Auth Service (`src/features/auth/auth.service.ts`)

### AS-001: `login(username, password, schoolSlug)`

```typescript
interface LoginInput {
  username: string;
  password: string;
  schoolSlug: string;
}

// Internally builds: `${username}@${schoolSlug}.app`
// Calls: supabase.auth.signInWithPassword({ email: syntheticEmail, password })
// Returns: AuthResult<{ session: Session; profile: Profile }>
```

**Note**: The login screen needs either a school slug input or a way to resolve the school. Options:
- User enters school slug as a separate field
- App stores the last-used school slug locally
- Username format includes school context (not chosen — too complex)

**Recommended**: Store school slug in AsyncStorage after first login. Show a "Switch School" option on login screen. First-time users enter school slug once.

---

### AS-002: `logout()`

```typescript
// Calls: supabase.auth.signOut()
// Clears: authStore (session, profile)
// Clears: queryClient cache
```

---

### AS-003: `getProfile(userId)`

```typescript
// Calls: supabase.from('profiles').select('*').eq('id', userId).single()
// Returns: AuthResult<Profile>
```

---

### AS-004: `getSession()`

```typescript
// Calls: supabase.auth.getSession()
// Returns: Session | null
```

---

## 3. Dashboard Services

### DS-001: Student Dashboard (`src/features/dashboard/student-dashboard.service.ts`)

```typescript
interface StudentDashboardData {
  student: Student & { level: Level };
  currentHomework: Homework[];          // is_completed = false, ordered by due_date
  recentAchievements: StudentAchievement[]; // last 5
  todayAttendance: Attendance | null;
  sessionCount: number;                 // total sessions
  stickerCount: number;                 // total stickers
}

// Query: Multiple parallel queries via Promise.all
// Key: ['student-dashboard', studentId]
```

---

### DS-002: Teacher Dashboard (`src/features/dashboard/teacher-dashboard.service.ts`)

```typescript
interface TeacherDashboardData {
  todaySessionCount: number;            // sessions where session_date = today
  todayStudentsSeen: number;            // distinct students from today's sessions
  totalStudents: number;                // students in teacher's classes
  recentSessions: Session[];            // last 5 sessions
  checkin: TeacherCheckin | null;       // today's checkin record
}

// Key: ['teacher-dashboard', teacherId]
```

---

### DS-003: Parent Dashboard (`src/features/dashboard/parent-dashboard.service.ts`)

```typescript
interface ParentDashboardData {
  children: (Student & {
    profile: Profile;
    className: string;
    level: Level;
    recentSession: Session | null;
    todayAttendance: Attendance | null;
  })[];
}

// Key: ['parent-dashboard', parentId]
```

---

### DS-004: Admin Dashboard (`src/features/dashboard/admin-dashboard.service.ts`)

```typescript
interface AdminDashboardData {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  todayAttendanceRate: number;          // percentage (0-100)
}

// Key: ['admin-dashboard', schoolId]
```

---

## 4. Session Service (`src/features/sessions/sessions.service.ts`)

### SS-001: `createSession(input)`

```typescript
interface CreateSessionInput {
  studentId: string;
  sessionDate: string;        // ISO date
  lessonId?: string;
  recitationQuality: number;  // 1-5
  tajweedScore: number;       // 1-5
  memorizationScore: number;  // 1-5
  notes?: string;
  homework?: {
    description: string;
    dueDate: string;          // ISO date
  };
}

// Calls: supabase.from('sessions').insert({...}).select().single()
// If homework: supabase.from('homework').insert({...})
// Points awarded by DB trigger (handle_session_points)
// Returns: Session
// Mutation Key: ['create-session']
// Invalidates: ['teacher-dashboard'], ['student-dashboard', studentId], ['sessions']
```

---

### SS-002: `getSessions(filters)`

```typescript
interface SessionFilters {
  studentId?: string;
  teacherId?: string;
  classId?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

// Query Key: ['sessions', filters]
// Returns: Session[] with joined profile (teacher name) and lesson title
```

---

### SS-003: `getSessionById(id)`

```typescript
// Query Key: ['sessions', id]
// Calls: supabase.from('sessions').select('*, profiles!teacher_id(full_name), lessons(title), homework(*)').eq('id', id).single()
// Returns: Session with relations
```

---

## 5. Student Management Service (`src/features/students/students.service.ts`)

### SM-001: `getStudents(filters)`

```typescript
interface StudentFilters {
  classId?: string;
  isActive?: boolean;
  search?: string;            // Matches full_name via profiles
  limit?: number;
  offset?: number;
}

// Query Key: ['students', filters]
// Calls: supabase.from('students').select('*, profiles!inner(full_name, username, avatar_url), classes(name), levels!current_level(title)')
// Returns: Student[] with profile, class name, and level title
```

---

### SM-002: `getStudentById(id)`

```typescript
// Query Key: ['students', id]
// Returns: Student with profile, class, level, parent profile
```

---

### SM-003: `updateStudent(id, input)`

```typescript
interface UpdateStudentInput {
  classId?: string | null;
  parentId?: string | null;
  isActive?: boolean;
  dateOfBirth?: string;
}

// Mutation Key: ['update-student']
// Invalidates: ['students'], ['student-dashboard', id]
```

---

### SM-004: `generateUsername(fullName)`

```typescript
// Pure function (client-side)
// Input: "Ahmed Ali"
// Output: "ahmedali_342" (lowercase, no spaces, _ + 3 random digits)
function generateUsername(fullName: string): string {
  const base = fullName.toLowerCase().replace(/\s+/g, '');
  const digits = String(Math.floor(Math.random() * 900) + 100); // 100-999
  return `${base}_${digits}`;
}
```

---

## 6. Class Management Service (`src/features/classes/classes.service.ts`)

### CM-001: `getClasses(filters)`

```typescript
interface ClassFilters {
  isActive?: boolean;
  teacherId?: string;
  search?: string;
}

// Query Key: ['classes', filters]
// Returns: Class[] with teacher profile (full_name), student count
```

---

### CM-002: `createClass(input)`

```typescript
interface CreateClassInput {
  name: string;
  description?: string;
  teacherId?: string;
  schedule?: Record<string, unknown>;
  maxStudents?: number;
}

// Mutation Key: ['create-class']
// Invalidates: ['classes'], ['admin-dashboard']
```

---

### CM-003: `updateClass(id, input)`

```typescript
interface UpdateClassInput {
  name?: string;
  description?: string;
  teacherId?: string | null;
  schedule?: Record<string, unknown>;
  maxStudents?: number;
  isActive?: boolean;
}

// Mutation Key: ['update-class']
// Invalidates: ['classes'], ['classes', id]
```

---

### CM-004: `assignStudentToClass(studentId, classId)`

```typescript
// Calls: supabase.from('students').update({ class_id: classId }).eq('id', studentId)
// Validates: class student count < max_students
// Invalidates: ['students'], ['classes', classId]
```

---

### CM-005: `removeStudentFromClass(studentId)`

```typescript
// Calls: supabase.from('students').update({ class_id: null }).eq('id', studentId)
// Invalidates: ['students'], ['classes']
```

---

## 7. Gamification Service (`src/features/gamification/gamification.service.ts`)

### GS-001: `getStickers(schoolId)`

```typescript
// Query Key: ['stickers', schoolId]
// Returns: Sticker[] (school's sticker catalog, active only by default)
```

---

### GS-002: `getStudentStickers(studentId)`

```typescript
// Query Key: ['student-stickers', studentId]
// Returns: StudentSticker[] with sticker details (name, image_url, category)
```

---

### GS-003: `awardSticker(input)`

```typescript
interface AwardStickerInput {
  studentId: string;
  stickerId: string;
  reason?: string;
}

// Mutation Key: ['award-sticker']
// Points awarded by DB trigger (handle_sticker_points)
// Invalidates: ['student-stickers', studentId], ['student-dashboard', studentId]
```

---

### GS-004: `getLeaderboard(classId, period)`

```typescript
type LeaderboardPeriod = 'weekly' | 'all-time';

interface LeaderboardEntry {
  rank: number;
  studentId: string;
  fullName: string;
  avatarUrl: string | null;
  points: number;
  level: number;
}

// Query Key: ['leaderboard', classId, period]
// All-time: SELECT from students WHERE class_id, ORDER BY total_points DESC LIMIT 10
// Weekly: Aggregate points from sessions, homework, student_stickers
//         WHERE created_at >= now() - interval '7 days'
//         AND student.class_id = classId
```

---

### GS-005: `getStudentTrophies(studentId)`

```typescript
// Query Key: ['student-trophies', studentId]
// Returns: { earned: Trophy[], locked: Trophy[] }
// Earned: JOIN student_trophies; Locked: trophies NOT IN student_trophies
```

---

### GS-006: `getStudentAchievements(studentId)`

```typescript
// Query Key: ['student-achievements', studentId]
// Returns: StudentAchievement[] with achievement details
```

---

### GS-007: `getLevels()`

```typescript
// Query Key: ['levels']
// Returns: Level[] ordered by level_number
// Cached aggressively (global data, rarely changes)
```

---

## 8. Lesson Service (`src/features/lessons/lessons.service.ts`)

### LS-001: `getLessons(filters)`

```typescript
interface LessonFilters {
  classId?: string;
  lessonType?: 'memorization' | 'revision' | 'tajweed' | 'recitation';
  search?: string;
}

// Query Key: ['lessons', filters]
// Returns: Lesson[] ordered by order_index
```

---

### LS-002: `getLessonProgress(studentId)`

```typescript
// Query Key: ['lesson-progress', studentId]
// Returns: LessonProgress[] with lesson details
// Groups by status: not_started, in_progress, completed
```

---

### LS-003: `updateLessonProgress(studentId, lessonId, input)`

```typescript
interface UpdateProgressInput {
  status: 'not_started' | 'in_progress' | 'completed';
  completionPercentage: number;
}

// Mutation Key: ['update-lesson-progress']
// Upsert on (student_id, lesson_id) unique constraint
// Invalidates: ['lesson-progress', studentId]
```

---

## 9. Attendance Service (`src/features/attendance/attendance.service.ts`)

### AT-001: `markBulkAttendance(input)`

```typescript
interface BulkAttendanceInput {
  classId: string;
  date: string;             // ISO date
  records: {
    studentId: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    notes?: string;
  }[];
}

// Mutation Key: ['mark-attendance']
// Uses upsert on (student_id, date) to handle re-submissions
// Calls: supabase.from('attendance').upsert(records, { onConflict: 'student_id,date' })
// Invalidates: ['attendance'], ['admin-dashboard'], ['parent-dashboard']
```

---

### AT-002: `getAttendanceCalendar(studentId, month, year)`

```typescript
interface AttendanceCalendarDay {
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
}

// Query Key: ['attendance-calendar', studentId, month, year]
// Returns: AttendanceCalendarDay[] for the specified month
// Used by: Parent attendance calendar, student profile
```

---

### AT-003: `getAttendanceRate(studentId)`

```typescript
// Query Key: ['attendance-rate', studentId]
// Returns: { rate: number, total: number, present: number, absent: number, late: number, excused: number }
```

---

### AT-004: `getClassAttendance(classId, date)`

```typescript
// Query Key: ['class-attendance', classId, date]
// Returns: Attendance[] for all students in the class for the specified date
// Used by: Admin attendance form (to pre-populate existing records)
```

---

## 10. Homework Service (`src/features/homework/homework.service.ts`)

### HW-001: `getStudentHomework(studentId, filters)`

```typescript
interface HomeworkFilters {
  isCompleted?: boolean;
  limit?: number;
}

// Query Key: ['homework', studentId, filters]
// Returns: Homework[] with session details
```

---

### HW-002: `completeHomework(homeworkId)`

```typescript
// Calls: supabase.from('homework').update({ is_completed: true, completed_at: new Date().toISOString() }).eq('id', homeworkId)
// Points awarded by DB trigger (handle_homework_points)
// Invalidates: ['homework', studentId], ['student-dashboard', studentId]
```

---

## 11. Teacher Check-in Service (`src/features/sessions/checkin.service.ts`)

### TC-001: `checkIn()`

```typescript
// Calls: supabase.from('teacher_checkins').insert({ teacher_id: userId, school_id })
// Invalidates: ['teacher-dashboard']
```

---

### TC-002: `checkOut(checkinId)`

```typescript
// Calls: supabase.from('teacher_checkins').update({ checked_out_at: new Date().toISOString() }).eq('id', checkinId)
// Invalidates: ['teacher-dashboard']
```

---

### TC-003: `getTodayCheckin(teacherId)`

```typescript
// Query Key: ['teacher-checkin', teacherId, today]
// Returns: TeacherCheckin | null
```

---

## 12. Children Service (`src/features/children/children.service.ts`)

### CH-001: `getChildren(parentId)`

```typescript
// Query Key: ['children', parentId]
// Calls: supabase.from('students').select('*, profiles!inner(*), classes(name), levels!current_level(*)').eq('parent_id', parentId)
// Returns: Student[] with profile, class name, level
```

---

### CH-002: `getChildDetail(studentId)`

```typescript
// Query Key: ['child-detail', studentId]
// Returns: Student with profile, class, level, recent sessions, sticker summary, attendance rate
```

---

### CH-003: `getClassStanding(studentId, classId)`

```typescript
interface ClassStandingEntry {
  rank: number;
  isCurrentStudent: boolean;
  points: number;
  // No name — anonymous for parent view
}

// Query Key: ['class-standing', studentId, classId]
// Returns: ClassStandingEntry[] — anonymous leaderboard
```

---

## 13. Profile Service (`src/features/profile/profile.service.ts`)

### PR-001: `getProfile(userId)`

```typescript
// Query Key: ['profile', userId]
// Returns: Profile with school name
```

---

### PR-002: `updateProfile(userId, input)`

```typescript
interface UpdateProfileInput {
  avatarUrl?: string;
  phone?: string;
  preferredLanguage?: 'en' | 'ar';
}

// Mutation Key: ['update-profile']
// Invalidates: ['profile', userId], authStore profile
```

---

## Query Key Convention

All query keys follow `[feature, ...params]`:

| Feature | Key Pattern |
|---------|-------------|
| Dashboard | `['student-dashboard', studentId]`, `['teacher-dashboard', teacherId]`, etc. |
| Sessions | `['sessions', filters]`, `['sessions', id]` |
| Students | `['students', filters]`, `['students', id]` |
| Classes | `['classes', filters]`, `['classes', id]` |
| Lessons | `['lessons', filters]`, `['lesson-progress', studentId]` |
| Gamification | `['stickers', schoolId]`, `['student-stickers', studentId]`, `['leaderboard', classId, period]` |
| Attendance | `['attendance-calendar', studentId, month, year]`, `['class-attendance', classId, date]` |
| Homework | `['homework', studentId, filters]` |
| Children | `['children', parentId]`, `['child-detail', studentId]` |
| Profile | `['profile', userId]` |
| Levels | `['levels']` |
