// ─── Supabase Database Types ────────────────────────────────────────────────
//
// Placeholder types that mirror the Supabase schema.
// This file will be replaced by `supabase gen types typescript` once the
// remote database is provisioned. Until then these stubs enable full
// type-checking across the codebase.
// ─────────────────────────────────────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      schools: {
        Row: {
          id: string;
          name: string;
          slug: string;
          timezone: string;
          settings: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          timezone?: string;
          settings?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          timezone?: string;
          settings?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
      };

      profiles: {
        Row: {
          id: string;
          school_id: string;
          role: 'student' | 'teacher' | 'parent' | 'admin';
          full_name: string;
          avatar_url: string | null;
          phone: string | null;
          preferred_language: 'en' | 'ar';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          school_id: string;
          role: 'student' | 'teacher' | 'parent' | 'admin';
          full_name: string;
          avatar_url?: string | null;
          phone?: string | null;
          preferred_language?: 'en' | 'ar';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          role?: 'student' | 'teacher' | 'parent' | 'admin';
          full_name?: string;
          avatar_url?: string | null;
          phone?: string | null;
          preferred_language?: 'en' | 'ar';
          created_at?: string;
          updated_at?: string;
        };
      };

      classes: {
        Row: {
          id: string;
          school_id: string;
          teacher_id: string;
          name: string;
          description: string | null;
          schedule: Record<string, unknown>;
          max_students: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          teacher_id: string;
          name: string;
          description?: string | null;
          schedule?: Record<string, unknown>;
          max_students?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          teacher_id?: string;
          name?: string;
          description?: string | null;
          schedule?: Record<string, unknown>;
          max_students?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      students: {
        Row: {
          id: string;
          profile_id: string;
          class_id: string;
          parent_id: string | null;
          enrollment_date: string;
          current_surah: number;
          current_ayah: number;
          total_points: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          class_id: string;
          parent_id?: string | null;
          enrollment_date?: string;
          current_surah?: number;
          current_ayah?: number;
          total_points?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          class_id?: string;
          parent_id?: string | null;
          enrollment_date?: string;
          current_surah?: number;
          current_ayah?: number;
          total_points?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      lessons: {
        Row: {
          id: string;
          class_id: string;
          teacher_id: string;
          lesson_type: 'memorization' | 'revision' | 'tajweed' | 'recitation';
          surah_number: number;
          start_ayah: number;
          end_ayah: number;
          title: string;
          notes: string | null;
          scheduled_date: string;
          status: 'not_started' | 'in_progress' | 'completed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          teacher_id: string;
          lesson_type: 'memorization' | 'revision' | 'tajweed' | 'recitation';
          surah_number: number;
          start_ayah: number;
          end_ayah: number;
          title: string;
          notes?: string | null;
          scheduled_date: string;
          status?: 'not_started' | 'in_progress' | 'completed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          teacher_id?: string;
          lesson_type?: 'memorization' | 'revision' | 'tajweed' | 'recitation';
          surah_number?: number;
          start_ayah?: number;
          end_ayah?: number;
          title?: string;
          notes?: string | null;
          scheduled_date?: string;
          status?: 'not_started' | 'in_progress' | 'completed';
          created_at?: string;
          updated_at?: string;
        };
      };

      lesson_progress: {
        Row: {
          id: string;
          lesson_id: string;
          student_id: string;
          score: number | null;
          teacher_notes: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          student_id: string;
          score?: number | null;
          teacher_notes?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          student_id?: string;
          score?: number | null;
          teacher_notes?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      sessions: {
        Row: {
          id: string;
          class_id: string;
          teacher_id: string;
          lesson_id: string | null;
          started_at: string;
          ended_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          teacher_id: string;
          lesson_id?: string | null;
          started_at?: string;
          ended_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          teacher_id?: string;
          lesson_id?: string | null;
          started_at?: string;
          ended_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      homework: {
        Row: {
          id: string;
          lesson_id: string;
          student_id: string;
          description: string;
          due_date: string;
          is_completed: boolean;
          completed_at: string | null;
          teacher_feedback: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          student_id: string;
          description: string;
          due_date: string;
          is_completed?: boolean;
          completed_at?: string | null;
          teacher_feedback?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          student_id?: string;
          description?: string;
          due_date?: string;
          is_completed?: boolean;
          completed_at?: string | null;
          teacher_feedback?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      attendance: {
        Row: {
          id: string;
          session_id: string;
          student_id: string;
          status: 'present' | 'absent' | 'late' | 'excused';
          checked_in_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          student_id: string;
          status: 'present' | 'absent' | 'late' | 'excused';
          checked_in_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          student_id?: string;
          status?: 'present' | 'absent' | 'late' | 'excused';
          checked_in_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      stickers: {
        Row: {
          id: string;
          school_id: string;
          name: string;
          image_url: string;
          category: 'memorization' | 'behavior' | 'attendance' | 'effort' | 'helping';
          points_value: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          name: string;
          image_url: string;
          category: 'memorization' | 'behavior' | 'attendance' | 'effort' | 'helping';
          points_value?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          name?: string;
          image_url?: string;
          category?: 'memorization' | 'behavior' | 'attendance' | 'effort' | 'helping';
          points_value?: number;
          created_at?: string;
        };
      };

      student_stickers: {
        Row: {
          id: string;
          student_id: string;
          sticker_id: string;
          awarded_by: string;
          awarded_at: string;
          reason: string | null;
        };
        Insert: {
          id?: string;
          student_id: string;
          sticker_id: string;
          awarded_by: string;
          awarded_at?: string;
          reason?: string | null;
        };
        Update: {
          id?: string;
          student_id?: string;
          sticker_id?: string;
          awarded_by?: string;
          awarded_at?: string;
          reason?: string | null;
        };
      };

      trophies: {
        Row: {
          id: string;
          school_id: string;
          name: string;
          description: string;
          image_url: string;
          criteria: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          name: string;
          description: string;
          image_url: string;
          criteria?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          name?: string;
          description?: string;
          image_url?: string;
          criteria?: Record<string, unknown>;
          created_at?: string;
        };
      };

      student_trophies: {
        Row: {
          id: string;
          student_id: string;
          trophy_id: string;
          awarded_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          trophy_id: string;
          awarded_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          trophy_id?: string;
          awarded_at?: string;
        };
      };

      achievements: {
        Row: {
          id: string;
          school_id: string;
          name: string;
          description: string;
          icon: string;
          condition_type: string;
          condition_value: number;
          points_reward: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          name: string;
          description: string;
          icon: string;
          condition_type: string;
          condition_value: number;
          points_reward?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          name?: string;
          description?: string;
          icon?: string;
          condition_type?: string;
          condition_value?: number;
          points_reward?: number;
          created_at?: string;
        };
      };

      student_achievements: {
        Row: {
          id: string;
          student_id: string;
          achievement_id: string;
          unlocked_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          achievement_id: string;
          unlocked_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          achievement_id?: string;
          unlocked_at?: string;
        };
      };

      teacher_checkins: {
        Row: {
          id: string;
          teacher_id: string;
          session_id: string;
          mood: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          session_id: string;
          mood: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          teacher_id?: string;
          session_id?: string;
          mood?: number;
          notes?: string | null;
          created_at?: string;
        };
      };
    };

    Views: Record<string, never>;

    Functions: Record<string, never>;

    Enums: {
      user_role: 'student' | 'teacher' | 'parent' | 'admin';
      attendance_status: 'present' | 'absent' | 'late' | 'excused';
      lesson_type: 'memorization' | 'revision' | 'tajweed' | 'recitation';
      lesson_status: 'not_started' | 'in_progress' | 'completed';
      sticker_category: 'memorization' | 'behavior' | 'attendance' | 'effort' | 'helping';
    };
  };
}

// ─── Convenience Aliases ────────────────────────────────────────────────────

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];
