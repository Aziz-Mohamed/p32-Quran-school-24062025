# Feature Specification: Quran School MVP (Phase 1)

**Feature Branch**: `001-mvp-phase1`
**Created**: 2026-02-08
**Status**: Draft
**Input**: User description: "Quran School MVP Phase 1 - Full product specification for the initial release including auth, student/teacher/parent/admin dashboards, session management, gamification, attendance, and multi-tenant school operations"

## Clarifications

### Session 2026-02-08

- Q: Can users self-register, or must an admin create all accounts? → A: Only school creation is self-service (the creator becomes admin). All other accounts (teachers, students, parents) are created by the admin within the school. No open registration.
- Q: What login identifier is used — email or username? → A: Username-based login. Admins generate usernames and passwords for all members. Internally, the system maps usernames to synthetic emails (e.g., `username@school-slug.app`) for Supabase Auth compatibility. Users never see the synthetic email. Password resets are performed by the admin in-app (no email sending).
- Q: When are gamification points calculated — synchronously or asynchronously? → A: Synchronous. Points update immediately when the triggering action is saved (session created, homework completed, sticker awarded). No background jobs.
- Q: What does "weekly" mean on the leaderboard — fixed calendar week or rolling window? → A: Rolling 7-day window. Counts points earned in the last 7 days from the current moment.
- Q: How are usernames generated when admin creates accounts? → A: System auto-generates from full name: lowercase concatenated name + `_` + 3 random digits (e.g., "Ahmed Ali" → `ahmedali_342`). Admin sees the suggestion and can tap refresh to regenerate digits, or edit before saving. Uniqueness is per-school only (synthetic email uses school slug: `username@school-slug.app`).
- Q: What defines an "activity day" for streak calculation? → A: A day where the student is marked present or late in attendance. Absent/excused days and days with no attendance record break the streak.
- Q: When are trophies and achievements auto-awarded? → A: Checked after any student stats update (total_points or current_streak change). A DB trigger on `students` evaluates all unearned trophies/achievements against current state and awards any whose criteria are met.

## Assumptions

- Authentication uses username/password. When the admin creates an account, the system auto-generates a username from the member's full name (lowercase concatenated + `_` + 3 random digits, e.g., `ahmedali_342`). The admin can refresh the digits or edit before saving. The admin also sets the initial password. Usernames are unique per school and mapped to synthetic emails internally (`username@school-slug.app`) for Supabase Auth compatibility.
- The app's first-launch screen offers two options: "Create a School" (self-service, creator becomes admin) or "Login" (for users whose accounts were created by an admin)
- All non-admin accounts (teachers, students, parents) are created by the school admin. There is no open self-registration.
- Password resets are admin-managed in-app. No email sending mechanism is required.
- Parents are linked to children by an admin. A parent sees only their own children's data
- Teachers see only students in classes they are assigned to
- Dark mode is excluded from Phase 1 (light mode only)
- Push notifications are excluded from Phase 1
- Offline support is excluded from Phase 1
- The app supports English and Arabic with full RTL/LTR switching
- Gamification points are calculated when sessions are logged or homework is completed, per the defined points table
- Leaderboards are class-scoped and show top 10 plus the current student's rank
- Stickers are school-scoped assets; trophies, achievements, and levels are global
- Login requires username + password + school slug (identifier). The school slug is stored locally after first successful login and pre-filled on subsequent logins
- Passwords require a minimum of 6 characters. No complexity requirements (uppercase, special chars) in Phase 1
- Edge Functions implement rollback on partial failure: if any step fails after auth user creation, the created auth user is deleted before returning an error
- Usernames must use Latin characters only (a-z, 0-9, underscore). Admin enters member's name in Latin script for username generation. Arabic script input is not supported for usernames
- Lessons are created by admins (any class) and teachers (their own classes)
- Students mark homework complete by tapping a "Mark Complete" button on the homework item (sets is_completed=true, completed_at=now())
- Sessions are immutable after creation in Phase 1. Teachers can view session history but cannot edit or delete sessions. This preserves points integrity
- "Declining scores" for teacher Needs Support view: average of last 3 sessions' scores is lower than the average of the previous 3, OR any score below 3 in the last 2 sessions
- 10 levels is the canonical count (per database seed data). `src/lib/constants.ts` will be updated to match
- The `homework_assigned` text field on `sessions` is a display-only convenience field. The `homework` table is the canonical source of truth for tracked homework with completion status
- A teacher can award the same sticker to the same student multiple times. Each award is a separate event with its own timestamp and reason (no unique constraint on student_id + sticker_id)
- Deactivating a user (is_active=false) does NOT revoke their auth session. The app checks is_active at login and session restore; deactivated users see a "your account has been deactivated" message and are redirected to login
- Rate limiting for the public `create-school` endpoint relies on Supabase Edge Function defaults in Phase 1. Custom rate limiting deferred
- Brute-force login protection relies on Supabase Auth built-in rate limiting (~30 requests/hour/IP) in Phase 1. Custom lockout deferred
- Confirmation dialogs are required for all destructive actions: deactivate user, remove student from class, reset password
- Write operation feedback: toast notification for success, inline error messages for validation failures, redirect to list screen after successful create/edit

## User Scenarios & Testing *(mandatory)*

### User Story 1 - School Creation, Login & Role Routing (Priority: P1)

A first-time user opens the app and sees two options: "Create a School" or "Login". If they choose "Create a School", they fill in school details (name, etc.) and their own profile info, becoming the admin of that school. If they choose "Login", they enter their username and password (provided by their school admin). Upon successful login, the app reads their profile role and routes them to the appropriate role-specific dashboard (student, teacher, parent, or admin). If a user forgets their password, they contact their admin who resets it in-app.

**Why this priority**: Without authentication and role routing, no other feature is accessible. School creation is the bootstrap mechanism for the entire system.

**Independent Test**: Can be fully tested by creating a school (verifying admin dashboard loads), then having the admin create accounts for each role, logging in with each, and verifying correct routing.

**Acceptance Scenarios**:

1. **Given** a user with no active session, **When** they open the app, **Then** they see two options: "Create a School" and "Login"
2. **Given** a user choosing "Create a School", **When** they fill in school details and their profile (name, username, password), **Then** a school is created, they become its admin, and they are routed to the admin dashboard
3. **Given** a user on the login screen, **When** they enter a valid username/password, **Then** they are authenticated and routed to their role-specific dashboard
4. **Given** a user on the login screen, **When** they enter invalid credentials, **Then** they see a clear error message and remain on the login screen
5. **Given** an authenticated user, **When** they reopen the app, **Then** their session is restored and they land on their role dashboard without re-entering credentials
6. **Given** an authenticated user, **When** they log out, **Then** their session is cleared and they see the initial screen (Create a School / Login)
7. **Given** a user who forgot their password, **When** they contact their admin, **Then** the admin can reset the user's password from the admin panel

---

### User Story 2 - Teacher Logs a Session & Awards Stickers (Priority: P1)

A teacher opens their dashboard, sees an overview of today (sessions logged, students seen), and navigates to create a new session. They select a student, set the date, choose a lesson reference, rate recitation quality, tajweed, and memorization on a 1-5 scale, add notes, and optionally assign homework with a due date. After saving, the student earns points. The teacher can also navigate to the award sticker page, select a student, pick a sticker from the school's sticker catalog, add an optional reason, and award it. The student receives points for the sticker.

**Why this priority**: Session logging is the core value proposition of the app — it is the primary data-creation workflow that feeds student progress, gamification, homework tracking, and parent visibility.

**Independent Test**: Can be tested by logging in as a teacher, creating a session for a student, verifying session appears in history, and awarding a sticker to verify points increment.

**Acceptance Scenarios**:

1. **Given** a logged-in teacher, **When** they view the dashboard, **Then** they see today's session count, students seen, and quick actions (Log Session, Award Sticker)
2. **Given** a teacher on the create-session screen, **When** they select a student, fill scores (1-5 each), add notes, and save, **Then** a session record is created and the student's total points increase
3. **Given** a teacher creating a session, **When** they assign homework with a description and due date, **Then** a homework record is created linked to the session and student
4. **Given** a teacher on the award-sticker screen, **When** they select a student, pick a sticker, and confirm, **Then** the sticker is awarded, the student's points increase by the sticker's value, and the award appears in the student's sticker collection
5. **Given** a teacher, **When** they view their student list, **Then** they see only students in classes assigned to them, with search and filter capabilities

---

### User Story 3 - Student Views Progress & Gamification (Priority: P1)

A student logs in and sees their dashboard showing their current level, a progress overview, current homework with due date, quick actions, and recent achievements. They can browse their assigned lessons grouped by status (in progress, not started, completed), view past session evaluations with scores, explore their sticker collection, visit their trophy room to see earned and locked trophies, and check the class leaderboard.

**Why this priority**: This is the primary consumer of all data created by teachers. Student engagement and gamification are the key differentiators of the app.

**Independent Test**: Can be tested by logging in as a student who has session history, stickers, and homework, and verifying all dashboard data, lesson list, session history, sticker grid, trophy room, and leaderboard render correctly.

**Acceptance Scenarios**:

1. **Given** a logged-in student, **When** they view the dashboard, **Then** they see a greeting with their name and level, a progress overview, current homework with due date, quick actions, and recent achievements
2. **Given** a student on the lessons tab, **When** they browse lessons, **Then** lessons are grouped by status (in progress, not started, completed) with title, surah/ayah range, type, and progress bar
3. **Given** a student, **When** they view session history, **Then** they see past sessions sorted by date with teacher name, scores, and notes
4. **Given** a student, **When** they view the stickers tab, **Then** they see a grid of collected stickers with total count, and locked stickers shown with reduced opacity
5. **Given** a student, **When** they visit the trophy room, **Then** earned trophies are displayed prominently and locked trophies show the criteria and progress toward earning them
6. **Given** a student, **When** they view the leaderboard, **Then** they see the top 10 students in their class ranked by points, with their own rank highlighted, and a toggle between weekly and all-time
7. **Given** a student whose total points cross a level threshold, **When** they view their dashboard, **Then** their current level reflects the new level

---

### User Story 4 - Admin Manages School Operations (Priority: P2)

An admin logs in and sees a dashboard with quick stats (total students, teachers, classes, today's attendance rate). They can perform full CRUD on students (create, view, edit, deactivate), teachers (create, view, edit, deactivate), and classes (create, edit, assign teacher, set schedule, manage student roster). Data is scoped to their school.

**Why this priority**: Admin operations enable the school to function — without the ability to create students, teachers, and classes, no other workflow can proceed. However, for initial testing, seed data can substitute for admin CRUD, making this P2.

**Independent Test**: Can be tested by logging in as an admin, creating a teacher, a class, and a student, assigning the student to the class and a parent, and verifying all records appear correctly.

**Acceptance Scenarios**:

1. **Given** a logged-in admin, **When** they view the dashboard, **Then** they see total students, total teachers, total classes, and today's attendance rate
2. **Given** an admin on the students page, **When** they enter a student's full name, **Then** the system auto-generates a username (e.g., `ahmedali_342`) which the admin can refresh or edit, sets a password, and after saving, the student record is created and visible in the student list
3. **Given** an admin viewing a student, **When** they edit the student's class or deactivate the student, **Then** the change is saved and reflected immediately
4. **Given** an admin on the teachers page, **When** they create a teacher with name and class assignment, **Then** the teacher record is created
5. **Given** an admin on the classes page, **When** they create a class with name, schedule, assigned teacher, and max students, **Then** the class is created and students can be assigned to it
6. **Given** an admin managing a class, **When** they add or remove students from the class roster, **Then** the student-class assignments update accordingly
7. **Given** an admin, **When** they search or filter students/teachers/classes, **Then** results are filtered within their school scope only

---

### User Story 5 - Admin Marks Bulk Attendance (Priority: P2)

An admin selects a class and date, sees all students in that class, and can mark each student as present, absent, late, or excused. They can use a "mark all present" shortcut and then adjust exceptions. Submitting creates attendance records for all students in the class for that date.

**Why this priority**: Attendance is a core school operation that feeds parent visibility and student streaks. It is grouped as P2 because it depends on classes and students being set up first.

**Independent Test**: Can be tested by selecting a class with enrolled students, marking attendance for today, and verifying records are created with correct statuses.

**Acceptance Scenarios**:

1. **Given** an admin on the attendance page, **When** they select a class, **Then** they see all students in that class listed with attendance status selectors
2. **Given** an admin viewing a class attendance form, **When** they tap "Mark All Present", **Then** all students are set to "present" and individual adjustments can still be made
3. **Given** an admin who has marked attendance for all students, **When** they submit, **Then** attendance records are created for each student for the selected date
4. **Given** an admin, **When** they attempt to mark attendance for a class/date combination that already exists, **Then** existing records are updated rather than duplicated

---

### User Story 6 - Parent Monitors Children (Priority: P2)

A parent logs in and sees a dashboard with a card per child showing name, class, level, and today's status. They can tap into a child's detail view to see progress, recent sessions with scores, and sticker collection summary. They can view an attendance calendar with color-coded days (present=green, absent=red, late=yellow, excused=blue) and an attendance rate. They can also see their child's class standing (rank) shown as an anonymous leaderboard.

**Why this priority**: Parent visibility is a key trust factor. It depends on session and attendance data being populated by teachers and admins.

**Independent Test**: Can be tested by logging in as a parent linked to one or more students, verifying child cards on the dashboard, child detail data, attendance calendar, and class standing all display correctly.

**Acceptance Scenarios**:

1. **Given** a logged-in parent, **When** they view the dashboard, **Then** they see a card for each linked child showing name, class, current level, and recent activity
2. **Given** a parent, **When** they tap on a child's card, **Then** they see the child's profile, current level, points, recent sessions with scores, and sticker summary
3. **Given** a parent viewing a child's attendance, **When** they open the attendance calendar, **Then** they see a monthly calendar with color-coded days and an overall attendance rate
4. **Given** a parent, **When** they view class standing for a child, **Then** they see their child's rank and an anonymous leaderboard (ranks only, no other students' names)
5. **Given** a parent with multiple children, **When** they switch between children, **Then** each child's data is independent and correctly displayed

---

### User Story 7 - Teacher Check-in & Student Insights (Priority: P3)

A teacher can check in at the start of their session and check out when done, recording their working hours. They can view analytics on their class: top performers, students needing support (declining scores or missing homework), and navigate to detailed student profiles showing performance charts, session history, sticker history, and attendance records.

**Why this priority**: Check-in and analytics enhance teacher efficiency but are not required for the core session-logging workflow to function.

**Independent Test**: Can be tested by logging in as a teacher, performing a check-in/check-out cycle, viewing the top performers and needs-support lists, and navigating to a student detail view.

**Acceptance Scenarios**:

1. **Given** a logged-in teacher, **When** they tap "Check In" on the dashboard, **Then** a check-in record is created with the current timestamp
2. **Given** a checked-in teacher, **When** they tap "Check Out", **Then** the check-out timestamp is recorded
3. **Given** a teacher, **When** they view "Top Performers", **Then** they see students ranked by total points or average scores
4. **Given** a teacher, **When** they view "Needs Support", **Then** they see students with declining scores or overdue homework
5. **Given** a teacher viewing a student detail, **When** they open the profile, **Then** they see performance scores over time, recent sessions, sticker history, and attendance record

---

### User Story 8 - Internationalization (EN/AR) (Priority: P3)

A user can switch between English and Arabic from their profile or settings. When Arabic is selected, the entire app layout flips to RTL: navigation, text alignment, icons, and spacing all mirror. When English is selected, the layout returns to LTR. All text in the app is displayed in the selected language.

**Why this priority**: Full i18n is essential for the target audience but can be layered on after core features work in a single language.

**Independent Test**: Can be tested by switching language to Arabic, verifying all screens render in RTL with Arabic text, then switching back to English and verifying LTR restoration.

**Acceptance Scenarios**:

1. **Given** a user with English selected, **When** they switch to Arabic, **Then** the app reloads with RTL layout and all strings in Arabic
2. **Given** a user with Arabic selected, **When** they switch to English, **Then** the app reloads with LTR layout and all strings in English
3. **Given** an Arabic-speaking user, **When** they navigate any screen, **Then** directional icons (arrows, chevrons) point in the correct RTL direction
4. **Given** any user, **When** they use the app in their selected language, **Then** no hardcoded English text appears anywhere in the UI

---

### Edge Cases

- What happens when a student has no class assignment? They see an empty lessons list and a message guiding them to contact their admin.
- What happens when a teacher has no classes assigned? They see an empty dashboard with a message indicating no classes are assigned.
- What happens when a parent has no linked children? They see an empty dashboard with a message to contact the school admin.
- What happens when a session is created for a student with no assigned lesson? The lesson field is optional; the session is still valid with scores and notes.
- What happens when attendance is submitted for a date that already has records? Existing records are updated (upsert behavior), not duplicated.
- What happens when a student's points cross multiple level thresholds at once? The student's level is set to the highest level they qualify for.
- What happens when a sticker is deactivated after being awarded? Previously awarded stickers remain in student collections; the sticker simply cannot be newly awarded.
- What happens when a class reaches max student capacity? The admin is prevented from adding more students and sees a clear message about the limit.
- What happens when a user's session token expires? The app detects the expired session and redirects to the login screen with a message.
- What happens when the network is unavailable? Users see appropriate error states on data-fetching screens. No offline mode in Phase 1.
- What happens when an admin creates a user with a username that already exists in the school? The system rejects the creation and displays a clear message that the username is taken.
- What happens when a user forgets their password? They contact their school admin, who resets the password in-app. There is no self-service password reset.
- What happens when a student with no class views the leaderboard? The leaderboard is class-scoped, so the student sees no leaderboard and a message to contact their admin. Sessions can still be logged for classless students.
- What happens when a teacher awards the same sticker to the same student again? It is allowed — each award is a separate event with its own timestamp and reason.

## Requirements *(mandatory)*

### Functional Requirements

**Authentication & Profiles**

- **FR-001**: System MUST allow a new user to create a school by providing school details and their own profile info (name, username, password); the creator becomes the school's admin
- **FR-002**: System MUST allow users to log in with username and password
- **FR-003**: Admins MUST be able to reset any school member's password from within the admin panel
- **FR-004**: System MUST persist user sessions across app restarts until explicit logout
- **FR-005**: System MUST route authenticated users to their role-specific dashboard upon login
- **FR-006**: System MUST enforce that all data access is scoped to the user's school

**Student Experience**

- **FR-007**: Students MUST see a dashboard with their current level, progress overview (points-to-next-level progress bar, sessions completed this week, homework completion rate), current homework with due date, quick actions, and recent achievements
- **FR-008**: Students MUST be able to browse lessons grouped by status (not started, in progress, completed)
- **FR-009**: Students MUST be able to view past session evaluations with date, teacher, scores, and notes
- **FR-010**: Students MUST be able to view their sticker collection as a grid with total count
- **FR-011**: Students MUST be able to view a trophy room showing earned trophies and locked trophies with criteria
- **FR-012**: Students MUST be able to view a class leaderboard (top 10 + own rank) with a toggle between "weekly" (rolling 7-day window of points earned) and "all-time" (total cumulative points)
- **FR-013**: System MUST track student streaks (current and longest consecutive attendance days). An "activity day" is defined as any day where the student is marked present or late in attendance. Absent and excused days break the streak. The streak counter resets to 0 on any gap day (no attendance record or absent/excused). Both `current_streak` and `longest_streak` are maintained on the `students` table
- **FR-014**: System MUST automatically assign the correct level based on total points and the levels table

**Teacher Experience**

- **FR-015**: Teachers MUST see a dashboard with today's session count, students seen count, and quick actions (Log Session, Award Sticker, Check In). Alerts are deferred to Phase 2
- **FR-016**: Teachers MUST be able to create a session with: student selection, date, lesson reference, recitation/tajweed/memorization scores (1-5), notes, and optional homework assignment
- **FR-017**: Teachers MUST be able to award stickers to students by selecting a student, picking a sticker, and providing an optional reason
- **FR-018**: Teachers MUST see only students in classes assigned to them
- **FR-019**: Teachers MUST be able to check in and check out, recording timestamps
- **FR-020**: Teachers MUST be able to view student detail profiles with performance history, sessions, stickers, and attendance

**Parent Experience**

- **FR-021**: Parents MUST see a dashboard with a card per linked child showing name, class, level, and status
- **FR-022**: Parents MUST be able to view each child's detailed progress including sessions, stickers, and current level
- **FR-023**: Parents MUST be able to view an attendance calendar per child with color-coded statuses
- **FR-024**: Parents MUST be able to view their child's class standing as an anonymous ranked list

**Admin Experience**

- **FR-025**: Admins MUST see a dashboard with total students, teachers, classes, and today's attendance rate
- **FR-026**: Admins MUST be able to create, view, edit, and deactivate students. When creating, the system auto-generates a username from the full name (lowercase concatenated + `_` + 3 random digits). The admin can refresh or edit the username before saving, and sets an initial password.
- **FR-027**: Admins MUST be able to create, view, edit, and deactivate teachers. Username generation follows the same pattern as FR-026.
- **FR-028**: Admins MUST be able to create, edit, and manage classes (assign teacher, set schedule, set max students)
- **FR-029**: Admins MUST be able to assign and remove students from classes
- **FR-029b**: Admins MUST be able to manage the school's sticker catalog: create stickers (name, image, category, point value), edit sticker details, and deactivate stickers. Deactivated stickers cannot be newly awarded but remain in students' existing collections
- **FR-030**: Admins MUST be able to mark bulk attendance per class (present/absent/late/excused) with "mark all present" shortcut. Teachers can also mark attendance for their own classes (per RLS), but the primary bulk attendance UI is admin-facing in Phase 1

**Gamification**

- **FR-031**: System MUST award points synchronously (immediately upon save) for: session completion (+10), good recitation score 4-5 (+5), on-time homework (+10), late homework (+5), daily streak bonus (+3 when attendance extends an active streak to 2+ consecutive days), perfect weekly attendance (+20 when streak reaches a multiple of 7). The student's total points and level MUST reflect the update before the save operation completes.
- **FR-032**: System MUST support 10 levels from Beginner (0 pts) to Quran Guardian (3500 pts)
- **FR-033**: System MUST support school-scoped stickers with name, image, category, and point value
- **FR-034**: System MUST support global trophies auto-awarded based on milestone criteria. Auto-award is triggered after any student stats update (points, streak). The system checks all unearned trophies against current student state and awards any whose criteria are met. Initial trophy criteria: (1) "First Steps" — earn 50+ total points, (2) "Sticker Collector" — earn 10+ stickers, (3) "Streak Master" — achieve 7+ day streak, (4) "Dedicated Learner" — complete 10+ sessions, (5) "Hafiz Rising" — complete 5+ lessons
- **FR-035**: System MUST support global achievements with badge images and point rewards. Auto-award is checked alongside trophies after student stats updates. Initial achievement criteria: (1) "Perfect Week" — 7 consecutive attendance days (+25 points), (2) "High Scorer" — score 5 in all 3 categories in a single session (+15 points), (3) "Homework Hero" — complete 10+ homework assignments (+20 points)

**Multi-Tenancy & Security**

- **FR-036**: System MUST enforce school-level data isolation — no user can access data from another school
- **FR-037**: System MUST enforce role-based access control for all data operations
- **FR-038**: System MUST validate all user inputs with appropriate constraints (score ranges, required fields, date formats)

**Internationalization**

- **FR-039**: System MUST support English and Arabic languages with complete translations
- **FR-040**: System MUST support full RTL/LTR layout switching when language changes

### Key Entities

- **School**: The multi-tenant root. Has name, slug, owner, address, phone, logo, settings. All school-scoped data traces back to a school.
- **Profile**: Extends the authenticated user. Has username (unique within school), role (student/teacher/parent/admin), full name, avatar, phone, preferred language. Linked to exactly one school.
- **Student**: Extended profile for students. Has class assignment, parent link, date of birth, enrollment date, current level, total points, streaks, active status.
- **Class**: A group of students with an assigned teacher. Has name, description, schedule, max capacity, active status.
- **Lesson**: A learning unit with surah reference, ayah range, and type (memorization/revision/tajweed/recitation). School-scoped, optionally class-linked.
- **Lesson Progress**: Tracks a student's status on a lesson (not started, in progress, completed) with completion percentage.
- **Session**: A teacher evaluation of a student. Contains scores for recitation, tajweed, and memorization (1-5 each), notes, and optional homework assignment.
- **Homework**: An assignment linked to a session and student, with description, due date, and completion status.
- **Attendance**: A daily record per student per class, with status (present/absent/late/excused) and the marker's identity.
- **Sticker**: A school-scoped reward with name, image, category, and point value. Can be active or retired.
- **Student Sticker**: Records a sticker awarded to a student, with awarder identity and optional reason.
- **Trophy**: A global milestone reward with criteria (e.g., sticker count thresholds, streak milestones). Auto-awarded.
- **Achievement**: A global badge with criteria and point reward. Auto-awarded.
- **Level**: A global progression tier defined by a level number, title, and points threshold.
- **Teacher Check-in**: Records a teacher's check-in and check-out timestamps for a given date.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can create a school and reach the admin dashboard within 60 seconds; existing users can log in and reach their dashboard within 15 seconds
- **SC-002**: A teacher can create a complete session (select student, rate scores, add notes, assign homework) in under 2 minutes
- **SC-003**: A teacher can award a sticker to a student in under 30 seconds
- **SC-004**: A student can view their dashboard, lessons, sessions, stickers, trophies, and leaderboard without encountering errors or missing data
- **SC-005**: An admin can create a new student, assign them to a class, and link a parent in under 3 minutes
- **SC-006**: An admin can mark attendance for a full class of 20 students in under 1 minute
- **SC-007**: A parent can view all children's progress, session history, and attendance calendar without seeing other families' data
- **SC-008**: The app correctly switches between English/Arabic with full RTL/LTR layout mirroring and no hardcoded strings visible
- **SC-009**: No user can access, view, or modify data belonging to a different school
- **SC-010**: Student points, levels, and streaks update correctly when sessions are logged, homework is completed, or stickers are awarded
- **SC-011**: All four role dashboards load and display data within 3 seconds on a typical mobile connection
- **SC-012**: 90% of users complete their primary task (teacher: log session, admin: mark attendance, parent: view child, student: check progress) on first attempt without assistance
