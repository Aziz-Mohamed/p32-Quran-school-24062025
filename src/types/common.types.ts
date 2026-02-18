// ─── User & Role Types ──────────────────────────────────────────────────────

export type UserRole = 'student' | 'teacher' | 'parent' | 'admin';

// ─── Attendance ─────────────────────────────────────────────────────────────

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

// ─── Lessons ────────────────────────────────────────────────────────────────

export type LessonType = 'memorization' | 'revision' | 'tajweed' | 'recitation';

export type LessonStatus = 'not_started' | 'in_progress' | 'completed';

// ─── Gamification ───────────────────────────────────────────────────────────

export type StickerCategory =
  | 'memorization'
  | 'behavior'
  | 'attendance'
  | 'effort'
  | 'helping';

// ─── Locale ─────────────────────────────────────────────────────────────────

export type SupportedLocale = 'en' | 'ar';

export type Direction = 'ltr' | 'rtl';

// ─── Generic API Response Types ─────────────────────────────────────────────

export interface ApiSuccessResponse<T> {
  data: T;
  error: null;
}

export interface ApiErrorResponse {
  data: null;
  error: {
    message: string;
    code?: string;
    details?: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ─── Pagination ─────────────────────────────────────────────────────────────

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ─── Sorting & Filtering ────────────────────────────────────────────────────

export type SortDirection = 'asc' | 'desc';

export interface SortParams<T extends string = string> {
  field: T;
  direction: SortDirection;
}

// ─── Utility Types ──────────────────────────────────────────────────────────

/** Makes specific keys of T required while keeping the rest unchanged */
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/** Makes specific keys of T optional while keeping the rest unchanged */
export type WithOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

/** Extracts the element type from an array type */
export type ArrayElement<T extends readonly unknown[]> =
  T extends readonly (infer U)[] ? U : never;
