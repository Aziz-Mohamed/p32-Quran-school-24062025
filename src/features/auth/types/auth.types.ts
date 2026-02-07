import type { UserRole } from '@/types/common.types';
import type { Tables } from '@/types/database.types';

// ─── Input Types ─────────────────────────────────────────────────────────────

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  schoolId: string;
}

export interface ResetPasswordInput {
  email: string;
}

// ─── Error Type ──────────────────────────────────────────────────────────────

export interface AuthError {
  message: string;
  code?: string;
}

// ─── Result Type ─────────────────────────────────────────────────────────────

export interface AuthResult<T = void> {
  data?: T;
  error?: AuthError;
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export type Profile = Tables<'profiles'>;
