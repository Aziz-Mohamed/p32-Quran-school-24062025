import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';
import type {
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  AuthResult,
  Profile,
} from '../types/auth.types';

class AuthService {
  /**
   * Sign in with email and password
   */
  async login(input: LoginInput): Promise<AuthResult<Session>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });

      if (error) {
        return {
          error: {
            message: error.message,
            code: error.code,
          },
        };
      }

      if (!data.session) {
        return {
          error: {
            message: 'No session returned',
          },
        };
      }

      return { data: data.session };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
        },
      };
    }
  }

  /**
   * Register a new user with profile data
   */
  async register(input: RegisterInput): Promise<AuthResult<Session>> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            full_name: input.fullName,
            role: input.role,
            school_id: input.schoolId,
          },
        },
      });

      if (error) {
        return {
          error: {
            message: error.message,
            code: error.code,
          },
        };
      }

      if (!data.session) {
        return {
          error: {
            message: 'Registration successful, but no session returned. Please check your email for verification.',
          },
        };
      }

      return { data: data.session };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
        },
      };
    }
  }

  /**
   * Sign out the current user
   */
  async logout(): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return {
          error: {
            message: error.message,
            code: error.code,
          },
        };
      }

      return {};
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
        },
      };
    }
  }

  /**
   * Request password reset email
   */
  async resetPassword(input: ResetPasswordInput): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(input.email, {
        redirectTo: 'myapp://reset-password',
      });

      if (error) {
        return {
          error: {
            message: error.message,
            code: error.code,
          },
        };
      }

      return {};
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
        },
      };
    }
  }

  /**
   * Fetch user profile from database
   */
  async getProfile(userId: string): Promise<AuthResult<Profile>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        return {
          error: {
            message: error.message,
            code: error.code,
          },
        };
      }

      if (!data) {
        return {
          error: {
            message: 'Profile not found',
          },
        };
      }

      return { data };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
        },
      };
    }
  }

  /**
   * Get current session
   */
  async getSession(): Promise<AuthResult<Session>> {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        return {
          error: {
            message: error.message,
            code: error.code,
          },
        };
      }

      if (!data.session) {
        return {
          error: {
            message: 'No active session',
          },
        };
      }

      return { data: data.session };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
        },
      };
    }
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(
    callback: (event: string, session: Session | null) => void
  ) {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });

    return data.subscription;
  }
}

export const authService = new AuthService();
