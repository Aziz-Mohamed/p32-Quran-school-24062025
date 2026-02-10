import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';
import type {
  LoginInput,
  CreateSchoolInput,
  CreateSchoolResponse,
  CreateMemberInput,
  CreateMemberResponse,
  ResetMemberPasswordInput,
  AuthResult,
  Profile,
} from '../types/auth.types';
import { buildSyntheticEmail } from '../types/auth.types';

const FUNCTIONS_URL = process.env.EXPO_PUBLIC_SUPABASE_URL
  ? `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1`
  : '';

class AuthService {
  /**
   * Force-refresh the session and return a fresh access token.
   * Needed because supabase.functions.invoke() may hold a stale token
   * even when the REST client has auto-refreshed.
   */
  private async getFreshToken(): Promise<string> {
    const { data, error } = await supabase.auth.refreshSession();

    if (error || !data.session) {
      if (__DEV__) {
        console.log('[AuthService] refreshSession failed:', error?.message);
      }
      throw new Error('Session expired. Please log in again.');
    }

    if (__DEV__) {
      const exp = data.session.expires_at
        ? new Date(data.session.expires_at * 1000).toISOString()
        : 'unknown';
      console.log('[AuthService] Token refreshed, expires:', exp);
    }

    return data.session.access_token;
  }

  /**
   * Sign in with username, password, and school slug.
   * Builds a synthetic email internally.
   */
  async login(input: LoginInput): Promise<AuthResult<Session>> {
    try {
      const email = buildSyntheticEmail(input.username, input.schoolSlug);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
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
          error: { message: 'No session returned' },
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
   * Create a new school and admin account via Edge Function.
   */
  async createSchool(input: CreateSchoolInput): Promise<AuthResult<CreateSchoolResponse>> {
    try {
      const response = await fetch(`${FUNCTIONS_URL}/create-school`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          error: {
            message: result.error || 'Failed to create school',
            code: result.code,
          },
        };
      }

      // Set the session in the Supabase client if we got one
      if (result.session?.access_token) {
        await supabase.auth.setSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token,
        });
      }

      return { data: result };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
        },
      };
    }
  }

  /**
   * Admin creates a new member via Edge Function.
   * Requires the caller to be authenticated as an admin.
   */
  async createMember(input: CreateMemberInput): Promise<AuthResult<CreateMemberResponse>> {
    try {
      const token = await this.getFreshToken();

      if (__DEV__) {
        console.log('[AuthService] createMember called for role:', input.role);
        console.log('[AuthService] token preview:', token.substring(0, 20) + '...');
      }

      const response = await fetch(`${FUNCTIONS_URL}/create-member`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
        },
        body: JSON.stringify(input),
      });

      const result = await response.json();

      if (__DEV__) {
        console.log('[AuthService] createMember response status:', response.status);
        console.log('[AuthService] createMember response body:', result);
      }

      if (!response.ok) {
        return {
          error: {
            message: result.error || result.message || 'Failed to create member',
            code: result.code,
          },
        };
      }

      return { data: result as CreateMemberResponse };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
        },
      };
    }
  }

  /**
   * Admin resets a member's password via Edge Function.
   */
  async resetMemberPassword(input: ResetMemberPasswordInput): Promise<AuthResult> {
    try {
      const token = await this.getFreshToken();

      const response = await fetch(`${FUNCTIONS_URL}/reset-member-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const result = await response.json();
        if (__DEV__) {
          console.log('[AuthService] resetMemberPassword error:', result);
        }
        return {
          error: {
            message: result.error || result.message || 'Failed to reset password',
            code: result.code,
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
          error: { message: 'Profile not found' },
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
          error: { message: 'No active session' },
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
