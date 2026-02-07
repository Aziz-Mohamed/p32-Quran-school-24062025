# Product Requirements Document (PRD)
## Quran School Mobile Application

**Version:** 1.0.0  
**Last Updated:** January 2025  
**Project:** p32-Quran-school-24062025

---

## 1. Executive Summary

### 1.1 Product Vision
A timeless, elegant, and highly usable Quran school mobile application designed to inspire learning and delight users of all ages. The app focuses on **minimum features for the simplest, most minimalist, and iconic subtle app experience with a low learning curve**, while maintaining best practices, modularity, and separation of concerns.

### 1.2 Core Value Proposition
- **Multi-role Platform:** Supports four distinct user roles (Student, Teacher, Parent, Admin) with role-specific dashboards and features
- **Bilingual & RTL Support:** Full Arabic (RTL) and English (LTR) language support with seamless layout adaptation
- **Modern Design System:** Elegant, minimalist UI with dark mode support, following a refined color palette and typography system
- **Gamification:** Sticker/trophy system, leaderboards, and progress tracking to motivate students
- **Comprehensive Management:** Complete school management system for classes, attendance, sessions, and student progress

### 1.3 Target Users
- **Students:** Children learning Quran recitation and memorization
- **Teachers:** Instructors managing classes and tracking student progress
- **Parents:** Guardians monitoring their children's progress and attendance
- **Administrators:** School staff managing the entire system, users, and classes

---

## 2. Technical Architecture

### 2.1 Technology Stack
- **Framework:** React Native with Expo (~53.0.12)
- **Navigation:** Expo Router (~5.1.0) with file-based routing
- **State Management:** React hooks and context
- **Internationalization:** i18next with react-i18next
- **Storage:** AsyncStorage for local data persistence
- **Styling:** StyleSheet with logical properties for RTL support
- **Platform Support:** iOS, Android, Web

### 2.2 Project Structure
```
app/
├── _layout.tsx          # Root layout with theme provider
├── index.tsx            # Home/role selection screen
├── auth/                # Authentication flows
│   ├── login.tsx
│   ├── register.tsx
│   ├── forgot-password.tsx
│   └── onboarding.tsx
├── student/             # Student role features
├── teacher/             # Teacher role features
├── parent/              # Parent role features
├── admin/               # Admin role features
└── shared/              # Shared screens (profile, settings, notifications)
```

### 2.3 Key Design Principles
- **Always use ThemedText and ThemedView** for all UI components
- **Use logical properties** (paddingStart, marginEnd) instead of directional properties
- **Normalize all style values** using `utils/normalize.ts` for consistency
- **RTL-first approach** with automatic layout mirroring
- **Dark mode support** via theme provider

---

## 3. User Roles & Features

### 3.1 Student Role

#### 3.1.1 Dashboard
- **Progress Overview:**
  - Points display (e.g., 1,250 points)
  - Level indicator (e.g., Level 5 - Qari)
  - Current homework assignment with progress bar
  - Last session rating (star-based, 1-5 stars)
- **Quick Actions:**
  - My Sessions
  - Leaderboard
  - My Stickers
  - Lessons
- **Recent Achievements:** Display of recently earned stickers/trophies

#### 3.1.2 Lessons
- Interactive lessons and resources
- Lesson progress tracking
- Start/Continue lesson functionality
- Lesson completion status

#### 3.1.3 Sessions
- Session history view
- Session details (date, rating, teacher notes)
- Progress tracking over time

#### 3.1.4 Stickers/Trophy Room
- Sticker album collection
- Trophy room display
- Achievement showcase

#### 3.1.5 Leaderboard
- Class/global rankings
- Points-based competition
- Student position display

#### 3.1.6 Profile
- Personal information
- Progress statistics
- Settings access

---

### 3.2 Teacher Role

#### 3.2.1 Dashboard
- **Check-In System:**
  - WiFi status indicator
  - Check-in button for session start
- **Today's Overview:**
  - Number of students
  - Number of sessions
  - Attendance percentage
- **Quick Actions:**
  - My Students
  - Session Log
  - Award Sticker
  - Class Progress
- **Alerts:**
  - Students needing support
  - Students ready for praise

#### 3.2.2 Students Management
- View all assigned students
- Individual student profiles
- Student progress tracking
- Performance metrics

#### 3.2.3 Session Log
- Create/edit session entries
- Record student attendance
- Add session notes
- Rate student performance

#### 3.2.4 Award Sticker
- Select student
- Choose sticker/trophy type
- Add achievement note
- Award and notify

#### 3.2.5 Class Progress
- Overall class statistics
- Individual student progress
- Attendance trends
- Performance analytics

#### 3.2.6 Top Performers
- Highlight outstanding students
- Recognition display
- Achievement showcase

#### 3.2.7 Needs Support
- List of students requiring extra help
- Support notes and recommendations
- Action items

#### 3.2.8 Messaging
- Communication with parents
- Message history
- Notifications

#### 3.2.9 Profile
- Teacher information
- Class assignments
- Settings

---

### 3.3 Parent Role

#### 3.3.1 Dashboard
- **Child Overview:**
  - Attendance percentage
  - Average rating
  - Sticker count
- **Current Homework:**
  - Assignment details
  - Progress bar
  - Completion status
- **Last Session:**
  - Session date
  - Rating display
  - Teacher notes
- **Quick Actions:**
  - Attendance
  - Sessions
  - Class Standing
  - Message Teacher

#### 3.3.2 Children Management
- View all children
- Switch between children
- Individual child profiles

#### 3.3.3 Attendance
- Detailed attendance records
- Attendance calendar
- Attendance statistics
- Absence tracking

#### 3.3.4 Sessions
- Complete session history
- Session details and notes
- Progress timeline

#### 3.3.5 Class Standing
- Child's position in class
- Comparison with peers
- Performance metrics

#### 3.3.6 Messaging
- Communication with teachers
- Message history
- Notifications

#### 3.3.7 Settings
- Account preferences
- Notification settings
- Language selection

---

### 3.4 Admin Role

#### 3.4.1 Dashboard
- **Quick Stats:**
  - Total students
  - Total teachers
  - Active classes
  - Today's attendance
- **WiFi Configuration:**
  - WiFi enable/disable toggle
  - SSID configuration
  - Password management
  - Connection status
- **Quick Actions:**
  - Add Student
  - Add Teacher
  - Create Class
  - Take Attendance

#### 3.4.2 Students Management
- **List View:**
  - Search functionality
  - Student cards with key metrics
  - Filter options
- **Student Details:**
  - Full profile information
  - Progress tracking
  - Attendance history
  - Performance metrics
- **Add/Edit Student:**
  - Form with validation
  - Class assignment
  - Parent linking

#### 3.4.3 Teachers Management
- **List View:**
  - Search functionality
  - Teacher cards
  - Filter options
- **Teacher Details:**
  - Full profile information
  - Class assignments
  - Performance metrics
- **Add/Edit Teacher:**
  - Form with validation
  - Class assignment
  - Permissions management

#### 3.4.4 Classes Management
- **List View:**
  - All classes overview
  - Class cards with statistics
- **Class Details:**
  - Student roster
  - Teacher assignment
  - Schedule information
  - Attendance statistics
- **Add/Edit Class:**
  - Class information form
  - Student assignment
  - Teacher assignment
  - Schedule configuration

#### 3.4.5 Attendance
- Daily attendance tracking
- Bulk attendance entry
- Attendance reports
- Absence management

#### 3.4.6 Reports
- Comprehensive reporting system
- Analytics and insights
- Export functionality

---

## 4. Authentication & Onboarding

### 4.1 Authentication Flow
1. **Onboarding Screen:** Welcome message and app introduction
2. **Login:** Email and password authentication
3. **Registration:** New user sign-up with role selection
4. **Forgot Password:** Password recovery via email

### 4.2 Role Selection
- Users select their role (Student, Teacher, Parent, Admin) during registration
- Role determines available features and navigation

### 4.3 Session Management
- Persistent login sessions
- Secure token storage
- Auto-logout on token expiration

---

## 5. Design System

### 5.1 Color Palette

#### Light Mode
- **Primary Background:** `#FFFFFF` (Pure white)
- **Surface:** `#F8F8F8` (Subtle off-white for cards)
- **Text Primary:** `#333333` (Dark gray for headings)
- **Text Secondary:** `#888888` (Medium gray for supporting text)
- **Accent Orange:** `#FF9800` (Vibrant orange for CTAs)
- **Accent Teal:** `#4DB6AC` (Calming teal for highlights)
- **Success:** `#81C784` (Soft green)
- **Warning:** `#FFB74D` (Softer orange)
- **Error:** `#EF9A9A` (Soft red)
- **Border:** `#EEEEEE` (Subtle light gray)

#### Dark Mode
- **Primary Background:** `#121212` (Deep dark gray)
- **Surface:** `#1E1E1E` (Slightly lighter dark gray)
- **Text Primary:** `#E0E0E0` (Light gray/off-white)
- **Text Secondary:** `#B0B0B0` (Muted light gray)
- **Accent Orange:** `#FFC107` (Brighter orange)
- **Accent Teal:** `#26A69A` (Deeper teal)
- **Success:** `#4CAF50` (Clear green)
- **Warning:** `#FF9800` (Standard orange)
- **Error:** `#F44336` (Clear red)
- **Border:** `#303030` (Subtle dark gray)

### 5.2 Typography

#### Headings (Serif Font)
- **H1 (Title):** 24-32px, Bold (700)
- **H2 (Subheading):** 18-20px, Bold (700)
- **Font:** Noto Naskh Arabic (Arabic), Playfair Display/Merriweather (Latin)

#### Body Text (Sans-serif Font)
- **Body:** 14-16px, Regular (400)
- **Caption/Small:** 12px, Regular (400)
- **Font:** Cairo (Arabic), Inter/Open Sans (Latin)

### 5.3 Components

#### Cards
- Rounded corners: 16px
- Subtle drop shadows: `0 4px 12px rgba(0, 0, 0, 0.08)`
- Padding: 16px (consistent internal padding)
- Background: `Colors.light.card` or `Colors.dark.card`

#### Buttons (Primary CTAs)
- Rounded corners: 8px
- Background: `Colors.light.secondary` (gold/amber) or `Colors.dark.secondary`
- Text: Bold sans-serif
- Touch targets: Minimum 44x44px

#### Tabs
- Pill-shaped design
- Active: Background filled with secondary color
- Inactive: Transparent or subtle background

#### Bottom Navigation
- Floating, pill-shaped container
- Clear icons (optional small labels)
- Active state highlighted with secondary color

### 5.4 Spacing & Sizing
- **Whitespace:** Generous spacing between elements
- **Padding:** Consistent, uniform padding (4px grid system)
- **Touch Targets:** Minimum 44x44px for all interactive elements
- **Logical Properties:** Use `padding-inline-start`, `margin-inline-end` for RTL support

---

## 6. Internationalization (i18n)

### 6.1 Supported Languages
- **Arabic (ar):** Full RTL support
- **English (en):** LTR support

### 6.2 Implementation
- **Library:** i18next with react-i18next
- **Storage:** AsyncStorage for language preference
- **Auto-detection:** Device locale detection on first launch
- **RTL Management:** Automatic RTL layout application via I18nManager

### 6.3 RTL Best Practices
- Always use `ThemedText` and `ThemedView` components
- Use logical properties for all spacing
- Mirror directional icons (arrows, chevrons)
- Test all screens in both LTR and RTL modes

---

## 7. Core Features & Functionality

### 7.1 Gamification System

#### Stickers/Trophies
- **Collection System:** Students earn stickers for achievements
- **Categories:** Various achievement types (recitation, memorization, attendance, etc.)
- **Display:** Sticker album/trophy room for viewing collection
- **Awarding:** Teachers can award stickers with notes

#### Points & Levels
- **Points System:** Students earn points for completed lessons, good attendance, etc.
- **Level Progression:** Levels based on accumulated points (e.g., Level 5 - Qari)
- **Leaderboard:** Ranking system for friendly competition

### 7.2 Progress Tracking

#### Student Progress
- Lesson completion tracking
- Homework progress bars
- Session history with ratings
- Overall performance metrics

#### Class Progress
- Aggregate class statistics
- Individual student comparisons
- Attendance trends
- Performance analytics

### 7.3 Session Management

#### Session Logging
- Teachers create session entries
- Record attendance
- Add performance ratings (1-5 stars)
- Add teacher notes
- Track session duration

#### Session History
- View all past sessions
- Filter by date, student, or class
- Export session data

### 7.4 Attendance System

#### Daily Attendance
- Quick check-in/check-out
- Bulk attendance entry
- Absence tracking
- Attendance statistics

#### Reports
- Attendance percentage calculations
- Monthly/yearly attendance reports
- Absence pattern analysis

### 7.5 Communication

#### Messaging
- Teacher-Parent messaging
- Message history
- Push notifications
- Read receipts

#### Notifications
- System-wide notification center
- Role-specific notifications
- Push notification support

### 7.6 Search & Filtering

#### Search Functionality
- Search students, teachers, classes
- Real-time search results
- Filter by multiple criteria

---

## 8. Technical Requirements

### 8.1 Performance
- Fast app startup (< 3 seconds)
- Smooth navigation transitions
- Optimized image loading
- Efficient data caching

### 8.2 Accessibility
- WCAG 2.1 AA contrast compliance
- Screen reader support
- Font scaling support
- Large touch targets (44x44px minimum)

### 8.3 Security
- Secure authentication
- Encrypted data storage
- Secure API communication
- Role-based access control

### 8.4 Offline Support
- Local data caching
- Offline mode for viewing data
- Sync when connection restored

### 8.5 Platform Support
- **iOS:** iOS 13+ support
- **Android:** Android 8.0+ support
- **Web:** Progressive Web App (PWA) support

---

## 9. User Experience (UX) Requirements

### 9.1 Navigation
- **Mobile:** Floating bottom navigation bar
- **Desktop/Admin:** Horizontal tab navigation or sidebar
- Clear navigation hierarchy
- Breadcrumb navigation where applicable

### 9.2 Feedback & Loading States
- Loading indicators for async operations
- Success/error messages
- Haptic feedback for interactions (iOS)
- Skeleton screens for content loading

### 9.3 Error Handling
- User-friendly error messages
- Retry mechanisms
- Graceful degradation
- Offline error handling

### 9.4 Onboarding
- Welcome screens for first-time users
- Feature tutorials
- Role-specific onboarding flows

---

## 10. Data Model (Conceptual)

### 10.1 Core Entities
- **Users:** Students, Teachers, Parents, Admins
- **Classes:** Class groups with schedules
- **Sessions:** Individual learning sessions
- **Lessons:** Learning content and resources
- **Stickers/Trophies:** Achievement awards
- **Attendance:** Daily attendance records
- **Messages:** Communication threads

### 10.2 Relationships
- Students belong to Classes
- Teachers teach Classes
- Parents have Children (Students)
- Sessions belong to Students and Teachers
- Stickers are awarded to Students by Teachers
- Attendance records link Students to Sessions/Dates

---

## 11. Future Enhancements (Roadmap)

### Phase 2 Features
- Audio recording for recitation practice
- AI-powered pronunciation feedback
- Video lesson integration
- Advanced analytics dashboard
- Parent-teacher conference scheduling
- Homework submission system
- Exam/test functionality
- Certificate generation

### Phase 3 Features
- Multi-school support
- Advanced reporting and analytics
- Integration with external learning platforms
- Social features (study groups)
- Advanced gamification (badges, challenges)
- Mobile app for parents (separate app)

---

## 12. Success Metrics

### 12.1 User Engagement
- Daily active users (DAU)
- Session completion rate
- Feature adoption rate
- User retention rate

### 12.2 Educational Outcomes
- Lesson completion rate
- Attendance improvement
- Student progress metrics
- Teacher satisfaction

### 12.3 Technical Metrics
- App crash rate (< 1%)
- Average load time (< 3 seconds)
- API response time (< 500ms)
- Error rate (< 0.5%)

---

## 13. Compliance & Privacy

### 13.1 Data Privacy
- GDPR compliance
- COPPA compliance (for children's data)
- Secure data storage
- User data export capability

### 13.2 Content Guidelines
- Age-appropriate content
- Cultural sensitivity
- Religious accuracy

---

## 14. Development Guidelines

### 14.1 Code Standards
- TypeScript for type safety
- ESLint for code quality
- Modular component architecture
- Reusable UI components

### 14.2 Testing Requirements
- Unit tests for utilities
- Component tests for UI
- Integration tests for flows
- E2E tests for critical paths

### 14.3 Documentation
- Component documentation
- API documentation
- User guides
- Developer guides

---

## 15. Deployment & Maintenance

### 15.1 Release Strategy
- Staged rollouts
- Feature flags
- A/B testing capability
- Rollback procedures

### 15.2 Monitoring
- Error tracking (Sentry/Crashlytics)
- Analytics (Firebase Analytics)
- Performance monitoring
- User feedback collection

---

## Appendix A: File Structure Reference

```
app/
├── _layout.tsx
├── index.tsx
├── auth/
│   ├── login.tsx
│   ├── register.tsx
│   ├── forgot-password.tsx
│   └── onboarding.tsx
├── student/
│   ├── dashboard.tsx
│   ├── lessons.tsx
│   ├── sessions.tsx
│   ├── stickers.tsx
│   ├── leaderboard.tsx
│   └── profile.tsx
├── teacher/
│   ├── dashboard.tsx
│   ├── students/
│   ├── session-log.tsx
│   ├── award-sticker.tsx
│   ├── class-progress.tsx
│   ├── top-performers.tsx
│   ├── needs-support.tsx
│   ├── messaging.tsx
│   └── profile.tsx
├── parent/
│   ├── dashboard.tsx
│   ├── children.tsx
│   ├── attendance.tsx
│   ├── sessions.tsx
│   ├── class-standing.tsx
│   ├── messaging.tsx
│   └── settings.tsx
├── admin/
│   ├── dashboard.tsx
│   ├── students/
│   ├── teachers/
│   ├── classes/
│   ├── attendance.tsx
│   └── reports.tsx
└── shared/
    ├── profile.tsx
    ├── settings.tsx
    └── notifications.tsx
```

---

## Appendix B: Key Components

- `ThemedText` - Text component with theme and RTL support
- `ThemedView` - View component with theme and RTL support
- `Card` - Reusable card component
- `PrimaryButton` - Primary CTA button
- `SearchBar` - Search input component
- `BottomNavBar` - Bottom navigation bar
- `StudentCard` - Student display card
- `MinimalCard` - Minimal card variant
- `MinimalListItem` - List item component
- `MetricDisplay` - Metric display component

---

## Document Control

**Version History:**
- v1.0.0 (January 2025) - Initial PRD based on codebase analysis

**Maintained By:** Development Team  
**Review Cycle:** Quarterly  
**Next Review:** April 2025

---

*This PRD is a living document and will be updated as the project evolves.*

