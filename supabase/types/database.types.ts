export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      academic_terms: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          is_current: boolean | null
          name_ar: string
          name_en: string
          start_date: string
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          is_current?: boolean | null
          name_ar: string
          name_en: string
          start_date: string
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          is_current?: boolean | null
          name_ar?: string
          name_en?: string
          start_date?: string
        }
        Relationships: []
      }
      achievements: {
        Row: {
          category: Database["public"]["Enums"]["achievement_category"]
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          display_order: number | null
          icon: string
          id: string
          is_active: boolean | null
          is_hidden: boolean | null
          name_ar: string
          name_en: string
          points_reward: number | null
          requirement_type: string
          requirement_value: number
          updated_at: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["achievement_category"]
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          display_order?: number | null
          icon?: string
          id?: string
          is_active?: boolean | null
          is_hidden?: boolean | null
          name_ar: string
          name_en: string
          points_reward?: number | null
          requirement_type: string
          requirement_value?: number
          updated_at?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["achievement_category"]
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          display_order?: number | null
          icon?: string
          id?: string
          is_active?: boolean | null
          is_hidden?: boolean | null
          name_ar?: string
          name_en?: string
          points_reward?: number | null
          requirement_type?: string
          requirement_value?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      admins: {
        Row: {
          admin_level: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          permissions: Json | null
          profile_id: string
          updated_at: string | null
        }
        Insert: {
          admin_level?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          profile_id: string
          updated_at?: string | null
        }
        Update: {
          admin_level?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          profile_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admins_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      class_enrollments: {
        Row: {
          class_id: string
          enrolled_at: string | null
          enrolled_by: string | null
          id: string
          is_active: boolean | null
          student_id: string
        }
        Insert: {
          class_id: string
          enrolled_at?: string | null
          enrolled_by?: string | null
          id?: string
          is_active?: boolean | null
          student_id: string
        }
        Update: {
          class_id?: string
          enrolled_at?: string | null
          enrolled_by?: string | null
          id?: string
          is_active?: boolean | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_enrollments_enrolled_by_fkey"
            columns: ["enrolled_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          created_at: string | null
          created_by: string | null
          description_ar: string | null
          description_en: string | null
          id: string
          is_active: boolean | null
          max_students: number | null
          name_ar: string
          name_en: string | null
          schedule: Json | null
          teacher_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          is_active?: boolean | null
          max_students?: number | null
          name_ar: string
          name_en?: string | null
          schedule?: Json | null
          teacher_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          is_active?: boolean | null
          max_students?: number | null
          name_ar?: string
          name_en?: string | null
          schedule?: Json | null
          teacher_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
          last_message_preview: string | null
          parent_id: string
          student_id: string | null
          teacher_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          parent_id: string
          student_id?: string | null
          teacher_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          parent_id?: string
          student_id?: string | null
          teacher_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          ayah_end: number | null
          ayah_start: number | null
          content_url: string | null
          created_at: string | null
          created_by: string | null
          description_ar: string | null
          description_en: string | null
          difficulty: Database["public"]["Enums"]["lesson_difficulty"]
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          lesson_type: Database["public"]["Enums"]["lesson_type"]
          order_index: number | null
          points_reward: number | null
          surah_number: number | null
          title_ar: string
          title_en: string | null
          updated_at: string | null
        }
        Insert: {
          ayah_end?: number | null
          ayah_start?: number | null
          content_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description_ar?: string | null
          description_en?: string | null
          difficulty?: Database["public"]["Enums"]["lesson_difficulty"]
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          lesson_type?: Database["public"]["Enums"]["lesson_type"]
          order_index?: number | null
          points_reward?: number | null
          surah_number?: number | null
          title_ar: string
          title_en?: string | null
          updated_at?: string | null
        }
        Update: {
          ayah_end?: number | null
          ayah_start?: number | null
          content_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description_ar?: string | null
          description_en?: string | null
          difficulty?: Database["public"]["Enums"]["lesson_difficulty"]
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          lesson_type?: Database["public"]["Enums"]["lesson_type"]
          order_index?: number | null
          points_reward?: number | null
          surah_number?: number | null
          title_ar?: string
          title_en?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      levels: {
        Row: {
          badge_url: string | null
          color_hex: string | null
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          id: number
          level_number: number
          name_ar: string
          name_en: string
          points_required: number
        }
        Insert: {
          badge_url?: string | null
          color_hex?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: number
          level_number: number
          name_ar: string
          name_en: string
          points_required: number
        }
        Update: {
          badge_url?: string | null
          color_hex?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: number
          level_number?: number
          name_ar?: string
          name_en?: string
          points_required?: number
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          attendance: boolean | null
          fcm_token: string | null
          level_up: boolean | null
          message_received: boolean | null
          parent_id: string
          sticker_earned: boolean | null
          updated_at: string | null
        }
        Insert: {
          attendance?: boolean | null
          fcm_token?: string | null
          level_up?: boolean | null
          message_received?: boolean | null
          parent_id: string
          sticker_earned?: boolean | null
          updated_at?: string | null
        }
        Update: {
          attendance?: boolean | null
          fcm_token?: string | null
          level_up?: boolean | null
          message_received?: boolean | null
          parent_id?: string
          sticker_earned?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: true
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body_ar: string
          body_en: string
          child_id: string | null
          created_at: string | null
          deep_link: string | null
          id: string
          metadata: Json | null
          parent_id: string | null
          read_at: string | null
          title_ar: string
          title_en: string
          type: string
        }
        Insert: {
          body_ar: string
          body_en: string
          child_id?: string | null
          created_at?: string | null
          deep_link?: string | null
          id?: string
          metadata?: Json | null
          parent_id?: string | null
          read_at?: string | null
          title_ar: string
          title_en: string
          type: string
        }
        Update: {
          body_ar?: string
          body_en?: string
          child_id?: string | null
          created_at?: string | null
          deep_link?: string | null
          id?: string
          metadata?: Json | null
          parent_id?: string | null
          read_at?: string | null
          title_ar?: string
          title_en?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_children: {
        Row: {
          can_receive_notifications: boolean | null
          can_view_progress: boolean | null
          id: string
          linked_at: string | null
          parent_id: string
          relationship: string | null
          student_id: string
        }
        Insert: {
          can_receive_notifications?: boolean | null
          can_view_progress?: boolean | null
          id?: string
          linked_at?: string | null
          parent_id: string
          relationship?: string | null
          student_id: string
        }
        Update: {
          can_receive_notifications?: boolean | null
          can_view_progress?: boolean | null
          id?: string
          linked_at?: string | null
          parent_id?: string
          relationship?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_children_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_children_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      parents: {
        Row: {
          created_at: string | null
          id: string
          notification_preferences: Json | null
          phone_number: string | null
          profile_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notification_preferences?: Json | null
          phone_number?: string | null
          profile_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notification_preferences?: Json | null
          phone_number?: string | null
          profile_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parents_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      point_rules: {
        Row: {
          created_at: string | null
          id: string
          rating_4_points: number
          rating_5_points: number
          streak_bonus_multiplier: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          rating_4_points?: number
          rating_5_points?: number
          streak_bonus_multiplier?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          rating_4_points?: number
          rating_5_points?: number
          streak_bonus_multiplier?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string
          full_name_ar: string | null
          id: string
          is_active: boolean | null
          preferred_language: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          full_name_ar?: string | null
          id: string
          is_active?: boolean | null
          preferred_language?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          full_name_ar?: string | null
          id?: string
          is_active?: boolean | null
          preferred_language?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      school_settings: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          current_term_id: string | null
          id: string
          logo_url: string | null
          school_name_ar: string
          school_name_en: string
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          current_term_id?: string | null
          id?: string
          logo_url?: string | null
          school_name_ar: string
          school_name_en: string
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          current_term_id?: string | null
          id?: string
          logo_url?: string | null
          school_name_ar?: string
          school_name_en?: string
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "school_settings_current_term_id_fkey"
            columns: ["current_term_id"]
            isOneToOne: false
            referencedRelation: "academic_terms"
            referencedColumns: ["id"]
          },
        ]
      }
      session_attendees: {
        Row: {
          created_at: string | null
          feedback: string | null
          id: string
          joined_at: string | null
          left_at: string | null
          score: number | null
          session_id: string
          status: string | null
          student_id: string
        }
        Insert: {
          created_at?: string | null
          feedback?: string | null
          id?: string
          joined_at?: string | null
          left_at?: string | null
          score?: number | null
          session_id: string
          status?: string | null
          student_id: string
        }
        Update: {
          created_at?: string | null
          feedback?: string | null
          id?: string
          joined_at?: string | null
          left_at?: string | null
          score?: number | null
          session_id?: string
          status?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_attendees_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_attendees_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      session_topic_links: {
        Row: {
          created_at: string | null
          id: string
          session_id: string
          topic_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          session_id: string
          topic_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          session_id?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_topic_links_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_topic_links_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "session_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      session_topics: {
        Row: {
          category: string
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name_ar: string
          name_en: string
          updated_at: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name_ar: string
          name_en: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name_ar?: string
          name_en?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sessions: {
        Row: {
          class_id: string | null
          created_at: string | null
          description_ar: string | null
          duration_minutes: number | null
          ended_at: string | null
          id: string
          is_recurring: boolean | null
          lesson_id: string | null
          notes: string | null
          recurrence_rule: string | null
          scheduled_at: string
          started_at: string | null
          status: Database["public"]["Enums"]["session_status"] | null
          teacher_id: string
          title_ar: string
          title_en: string | null
          updated_at: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string | null
          description_ar?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          is_recurring?: boolean | null
          lesson_id?: string | null
          notes?: string | null
          recurrence_rule?: string | null
          scheduled_at: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["session_status"] | null
          teacher_id: string
          title_ar: string
          title_en?: string | null
          updated_at?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string | null
          description_ar?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          is_recurring?: boolean | null
          lesson_id?: string | null
          notes?: string | null
          recurrence_rule?: string | null
          scheduled_at?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["session_status"] | null
          teacher_id?: string
          title_ar?: string
          title_en?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      stickers: {
        Row: {
          category: Database["public"]["Enums"]["sticker_category"]
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          display_order: number | null
          id: string
          image_url: string
          is_active: boolean | null
          name_ar: string
          name_en: string
          points_value: number | null
          rarity: Database["public"]["Enums"]["sticker_rarity"] | null
          updated_at: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["sticker_category"]
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          is_active?: boolean | null
          name_ar: string
          name_en: string
          points_value?: number | null
          rarity?: Database["public"]["Enums"]["sticker_rarity"] | null
          updated_at?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["sticker_category"]
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          name_ar?: string
          name_en?: string
          points_value?: number | null
          rarity?: Database["public"]["Enums"]["sticker_rarity"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      student_achievements: {
        Row: {
          achievement_id: string
          completed_at: string | null
          created_at: string | null
          current_progress: number | null
          id: string
          is_completed: boolean | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          achievement_id: string
          completed_at?: string | null
          created_at?: string | null
          current_progress?: number | null
          id?: string
          is_completed?: boolean | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          achievement_id?: string
          completed_at?: string | null
          created_at?: string | null
          current_progress?: number | null
          id?: string
          is_completed?: boolean | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_achievements_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_lessons: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          lesson_id: string
          notes: string | null
          progress_percent: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          score: number | null
          started_at: string | null
          status: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id: string
          notes?: string | null
          progress_percent?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          score?: number | null
          started_at?: string | null
          status?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id?: string
          notes?: string | null
          progress_percent?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          score?: number | null
          started_at?: string | null
          status?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_lessons_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_lessons_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_lessons_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_stickers: {
        Row: {
          awarded_by: string | null
          earned_at: string | null
          earned_reason: string | null
          id: string
          sticker_id: string
          student_id: string
        }
        Insert: {
          awarded_by?: string | null
          earned_at?: string | null
          earned_reason?: string | null
          id?: string
          sticker_id: string
          student_id: string
        }
        Update: {
          awarded_by?: string | null
          earned_at?: string | null
          earned_reason?: string | null
          id?: string
          sticker_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_stickers_awarded_by_fkey"
            columns: ["awarded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_stickers_sticker_id_fkey"
            columns: ["sticker_id"]
            isOneToOne: false
            referencedRelation: "stickers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_stickers_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_trophies: {
        Row: {
          earned_at: string | null
          id: string
          student_id: string
          trophy_id: string
        }
        Insert: {
          earned_at?: string | null
          id?: string
          student_id: string
          trophy_id: string
        }
        Update: {
          earned_at?: string | null
          id?: string
          student_id?: string
          trophy_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_trophies_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_trophies_trophy_id_fkey"
            columns: ["trophy_id"]
            isOneToOne: false
            referencedRelation: "trophies"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          created_at: string | null
          current_level: number | null
          current_streak: number | null
          current_xp: number | null
          date_of_birth: string | null
          guardian_phone: string | null
          id: string
          last_activity_date: string | null
          longest_streak: number | null
          notes: string | null
          profile_id: string
          total_points: number | null
          updated_at: string | null
          xp_to_next_level: number | null
        }
        Insert: {
          created_at?: string | null
          current_level?: number | null
          current_streak?: number | null
          current_xp?: number | null
          date_of_birth?: string | null
          guardian_phone?: string | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          notes?: string | null
          profile_id: string
          total_points?: number | null
          updated_at?: string | null
          xp_to_next_level?: number | null
        }
        Update: {
          created_at?: string | null
          current_level?: number | null
          current_streak?: number | null
          current_xp?: number | null
          date_of_birth?: string | null
          guardian_phone?: string | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          notes?: string | null
          profile_id?: string
          total_points?: number | null
          updated_at?: string | null
          xp_to_next_level?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "students_current_level_fkey"
            columns: ["current_level"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["level_number"]
          },
          {
            foreignKeyName: "students_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_check_ins: {
        Row: {
          check_in_time: string
          check_out_time: string | null
          created_at: string | null
          date: string
          id: string
          is_outside_hours: boolean | null
          teacher_id: string
          updated_at: string | null
        }
        Insert: {
          check_in_time?: string
          check_out_time?: string | null
          created_at?: string | null
          date?: string
          id?: string
          is_outside_hours?: boolean | null
          teacher_id: string
          updated_at?: string | null
        }
        Update: {
          check_in_time?: string
          check_out_time?: string | null
          created_at?: string | null
          date?: string
          id?: string
          is_outside_hours?: boolean | null
          teacher_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teacher_check_ins_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_students: {
        Row: {
          assigned_at: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          student_id: string
          teacher_id: string
        }
        Insert: {
          assigned_at?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          student_id: string
          teacher_id: string
        }
        Update: {
          assigned_at?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          student_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_students_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          bio_ar: string | null
          bio_en: string | null
          created_at: string | null
          id: string
          is_available: boolean | null
          profile_id: string
          specialization: string | null
          updated_at: string | null
          years_of_experience: number | null
        }
        Insert: {
          bio_ar?: string | null
          bio_en?: string | null
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          profile_id: string
          specialization?: string | null
          updated_at?: string | null
          years_of_experience?: number | null
        }
        Update: {
          bio_ar?: string | null
          bio_en?: string | null
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          profile_id?: string
          specialization?: string | null
          updated_at?: string | null
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "teachers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          category: string
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name_ar: string
          name_en: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name_ar: string
          name_en: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name_ar?: string
          name_en?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      trophies: {
        Row: {
          category: Database["public"]["Enums"]["trophy_category"]
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          display_order: number | null
          id: string
          image_url: string
          is_active: boolean | null
          name_ar: string
          name_en: string
          rarity: Database["public"]["Enums"]["sticker_rarity"]
          requirement_type: string
          requirement_value: number
          updated_at: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["trophy_category"]
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          is_active?: boolean | null
          name_ar: string
          name_en: string
          rarity?: Database["public"]["Enums"]["sticker_rarity"]
          requirement_type: string
          requirement_value?: number
          updated_at?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["trophy_category"]
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          name_ar?: string
          name_en?: string
          rarity?: Database["public"]["Enums"]["sticker_rarity"]
          requirement_type?: string
          requirement_value?: number
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_points:
        | {
            Args: { p_points: number; p_student_id: string }
            Returns: {
              current_level: number
              current_xp: number
              leveled_up: boolean
              student_id: string
              total_points: number
            }[]
          }
        | {
            Args: { p_points: number; p_reason?: string; p_student_id: string }
            Returns: {
              leveled_up: boolean
              new_level: number
              new_level_name_ar: string
              new_level_name_en: string
              new_total_points: number
              new_xp: number
              xp_needed: number
            }[]
          }
      award_sticker: {
        Args: {
          p_awarded_by?: string
          p_reason?: string
          p_sticker_id: string
          p_student_id: string
        }
        Returns: {
          leveled_up: boolean
          message: string
          new_level: number
          points_awarded: number
          success: boolean
        }[]
      }
      cancel_account_deletion: {
        Args: { p_parent_profile_id: string }
        Returns: Json
      }
      deduct_points: {
        Args: { p_points: number; p_student_id: string }
        Returns: {
          student_id: string
          total_points: number
        }[]
      }
      export_parent_data: {
        Args: { p_parent_profile_id: string }
        Returns: Json
      }
      get_attendance_trends: {
        Args: { p_class_id: string; p_period?: string }
        Returns: {
          attendance_rate: number
          date: string
          present_count: number
          total_students: number
        }[]
      }
      get_child_dashboard_data: {
        Args: { p_child_id: string; p_parent_profile_id: string }
        Returns: Json
      }
      get_class_metrics: {
        Args: { p_class_id: string; p_period_days?: number }
        Returns: {
          attendance_rate: number
          avg_session_rating: number
          class_id: string
          class_name: string
          total_class_points: number
          total_sessions: number
          total_students: number
        }[]
      }
      get_engagement_trends: {
        Args: { p_days?: number }
        Returns: {
          active_students: number
          average_score: number
          day: string
          sessions_count: number
          stickers_awarded: number
        }[]
      }
      get_school_summary: {
        Args: never
        Returns: {
          active_classes: number
          total_admins: number
          total_classes: number
          total_parents: number
          total_sessions_this_month: number
          total_stickers_awarded: number
          total_students: number
          total_teachers: number
        }[]
      }
      get_sticker_popularity: {
        Args: { p_days?: number }
        Returns: {
          category: Database["public"]["Enums"]["sticker_category"]
          image_url: string
          name_ar: string
          name_en: string
          percentage_of_total: number
          rarity: Database["public"]["Enums"]["sticker_rarity"]
          sticker_id: string
          times_awarded: number
        }[]
      }
      get_student_dashboard: {
        Args: { p_profile_id: string }
        Returns: {
          avatar_url: string
          current_level: number
          current_streak: number
          current_xp: number
          full_name: string
          full_name_ar: string
          level_color: string
          level_name_ar: string
          level_name_en: string
          longest_streak: number
          recent_stickers: Json
          student_id: string
          total_points: number
          total_stickers: number
          xp_progress_percent: number
          xp_to_next_level: number
        }[]
      }
      get_students_needing_support: {
        Args: {
          p_attendance_threshold?: number
          p_days_inactive?: number
          p_rating_threshold?: number
          p_teacher_id: string
        }
        Returns: {
          attendance_rate: number
          avatar_url: string
          avg_rating: number
          days_since_last_session: number
          full_name: string
          full_name_ar: string
          reason: string
          student_id: string
          total_sessions: number
        }[]
      }
      get_teacher_activity: {
        Args: { p_days?: number }
        Returns: {
          average_score: number
          sessions_count: number
          stickers_awarded: number
          students_taught: number
          teacher_id: string
          teacher_name: string
        }[]
      }
      get_teacher_statistics: {
        Args: { p_teacher_id: string }
        Returns: {
          tenure_days: number
          total_sessions: number
          total_students: number
        }[]
      }
      get_upcoming_classes: {
        Args: { p_child_id: string; p_parent_profile_id: string }
        Returns: {
          class_id: string
          class_name_ar: string
          class_name_en: string
          duration_minutes: number
          scheduled_date: string
          teacher_id: string
          teacher_name: string
        }[]
      }
      request_account_deletion: {
        Args: { p_parent_profile_id: string }
        Returns: Json
      }
      update_streak: {
        Args: { p_student_id: string }
        Returns: {
          current_streak: number
          is_new_record: boolean
          longest_streak: number
          streak_bonus_points: number
        }[]
      }
    }
    Enums: {
      achievement_category:
        | "learning"
        | "attendance"
        | "social"
        | "collection"
        | "mastery"
        | "special"
      lesson_difficulty: "beginner" | "intermediate" | "advanced"
      lesson_type:
        | "quran_recitation"
        | "quran_memorization"
        | "tajweed"
        | "islamic_studies"
      session_status:
        | "scheduled"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "missed"
      sticker_category:
        | "quran"
        | "prayer"
        | "behavior"
        | "attendance"
        | "achievement"
        | "special"
      sticker_rarity: "common" | "uncommon" | "rare" | "epic" | "legendary"
      trophy_category:
        | "milestone"
        | "streak"
        | "completion"
        | "competition"
        | "special"
      user_role: "student" | "teacher" | "parent" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      achievement_category: [
        "learning",
        "attendance",
        "social",
        "collection",
        "mastery",
        "special",
      ],
      lesson_difficulty: ["beginner", "intermediate", "advanced"],
      lesson_type: [
        "quran_recitation",
        "quran_memorization",
        "tajweed",
        "islamic_studies",
      ],
      session_status: [
        "scheduled",
        "in_progress",
        "completed",
        "cancelled",
        "missed",
      ],
      sticker_category: [
        "quran",
        "prayer",
        "behavior",
        "attendance",
        "achievement",
        "special",
      ],
      sticker_rarity: ["common", "uncommon", "rare", "epic", "legendary"],
      trophy_category: [
        "milestone",
        "streak",
        "completion",
        "competition",
        "special",
      ],
      user_role: ["student", "teacher", "parent", "admin"],
    },
  },
} as const
