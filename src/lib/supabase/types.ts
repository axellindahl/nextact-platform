export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "athlete" | "coach" | "admin";

export type SubscriptionTier = "free" | "standard" | "premium";

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "expired";

export type AgeBracket = "13-14" | "15-18" | "19-25" | "26+";

export type ActProcess =
  | "values"
  | "acceptance"
  | "defusion"
  | "present_moment"
  | "self_as_context"
  | "committed_action"
  | "integration";

export type LessonType = "video" | "text" | "exercise" | "reflection" | "quiz";

export type LessonStatus = "draft" | "review" | "published";

export type ProgressStatus = "not_started" | "in_progress" | "completed";

export type AiContextType = "general" | "lesson" | "exercise" | "check_in";

export type AiMessageRole = "user" | "assistant";

export type NotificationChannel = "email" | "sms" | "in_app";

export type NotificationStatus = "pending" | "sent" | "failed" | "read";

export type BlogPostStatus = "draft" | "published";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          sport: string;
          age_bracket: AgeBracket | null;
          subscription_tier: SubscriptionTier;
          subscription_status: SubscriptionStatus;
          preferred_language: string;
          notification_preferences: Json;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          sport?: string;
          age_bracket?: AgeBracket | null;
          subscription_tier?: SubscriptionTier;
          subscription_status?: SubscriptionStatus;
          preferred_language?: string;
          notification_preferences?: Json;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          sport?: string;
          age_bracket?: AgeBracket | null;
          subscription_tier?: SubscriptionTier;
          subscription_status?: SubscriptionStatus;
          preferred_language?: string;
          notification_preferences?: Json;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      programs: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      modules: {
        Row: {
          id: string;
          program_id: string | null;
          title: string;
          description: string | null;
          act_process: ActProcess | null;
          icon: string | null;
          color_theme: string | null;
          order: number;
          estimated_duration_minutes: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          program_id?: string | null;
          title: string;
          description?: string | null;
          act_process?: ActProcess | null;
          icon?: string | null;
          color_theme?: string | null;
          order?: number;
          estimated_duration_minutes?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          program_id?: string | null;
          title?: string;
          description?: string | null;
          act_process?: ActProcess | null;
          icon?: string | null;
          color_theme?: string | null;
          order?: number;
          estimated_duration_minutes?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "modules_program_id_fkey";
            columns: ["program_id"];
            isOneToOne: false;
            referencedRelation: "programs";
            referencedColumns: ["id"];
          },
        ];
      };
      lessons: {
        Row: {
          id: string;
          module_id: string | null;
          title: string;
          order: number;
          lesson_type: LessonType | null;
          content: Json;
          vimeo_video_id: string | null;
          duration_seconds: number | null;
          metadata: Json;
          status: LessonStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          module_id?: string | null;
          title: string;
          order?: number;
          lesson_type?: LessonType | null;
          content?: Json;
          vimeo_video_id?: string | null;
          duration_seconds?: number | null;
          metadata?: Json;
          status?: LessonStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          module_id?: string | null;
          title?: string;
          order?: number;
          lesson_type?: LessonType | null;
          content?: Json;
          vimeo_video_id?: string | null;
          duration_seconds?: number | null;
          metadata?: Json;
          status?: LessonStatus;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "modules";
            referencedColumns: ["id"];
          },
        ];
      };
      lesson_progress: {
        Row: {
          id: string;
          user_id: string | null;
          lesson_id: string | null;
          status: ProgressStatus;
          started_at: string | null;
          completed_at: string | null;
          responses: Json;
          ai_feedback: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          lesson_id?: string | null;
          status?: ProgressStatus;
          started_at?: string | null;
          completed_at?: string | null;
          responses?: Json;
          ai_feedback?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          lesson_id?: string | null;
          status?: ProgressStatus;
          started_at?: string | null;
          completed_at?: string | null;
          responses?: Json;
          ai_feedback?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
        ];
      };
      module_progress: {
        Row: {
          id: string;
          user_id: string | null;
          module_id: string | null;
          lessons_completed: number;
          lessons_total: number;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          module_id?: string | null;
          lessons_completed?: number;
          lessons_total?: number;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          module_id?: string | null;
          lessons_completed?: number;
          lessons_total?: number;
          completed_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "module_progress_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "modules";
            referencedColumns: ["id"];
          },
        ];
      };
      user_streaks: {
        Row: {
          id: string;
          user_id: string | null;
          current_streak: number;
          longest_streak: number;
          last_activity_date: string | null;
          streak_freezes_used: number;
          streak_freezes_available: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          current_streak?: number;
          longest_streak?: number;
          last_activity_date?: string | null;
          streak_freezes_used?: number;
          streak_freezes_available?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          current_streak?: number;
          longest_streak?: number;
          last_activity_date?: string | null;
          streak_freezes_used?: number;
          streak_freezes_available?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      toughness_model: {
        Row: {
          id: string;
          user_id: string | null;
          values_score: number;
          acceptance_score: number;
          defusion_score: number;
          present_moment_score: number;
          self_as_context_score: number;
          committed_action_score: number;
          snapshot_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          values_score?: number;
          acceptance_score?: number;
          defusion_score?: number;
          present_moment_score?: number;
          self_as_context_score?: number;
          committed_action_score?: number;
          snapshot_date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          values_score?: number;
          acceptance_score?: number;
          defusion_score?: number;
          present_moment_score?: number;
          self_as_context_score?: number;
          committed_action_score?: number;
          snapshot_date?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      ai_conversations: {
        Row: {
          id: string;
          user_id: string | null;
          context_type: AiContextType;
          context_id: string | null;
          summary: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          context_type?: AiContextType;
          context_id?: string | null;
          summary?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          context_type?: AiContextType;
          context_id?: string | null;
          summary?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      ai_messages: {
        Row: {
          id: string;
          conversation_id: string | null;
          role: AiMessageRole;
          content: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id?: string | null;
          role: AiMessageRole;
          content: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string | null;
          role?: AiMessageRole;
          content?: string;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "ai_conversations";
            referencedColumns: ["id"];
          },
        ];
      };
      ai_usage: {
        Row: {
          id: string;
          user_id: string | null;
          date: string;
          messages_count: number;
          input_tokens: number;
          output_tokens: number;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          date?: string;
          messages_count?: number;
          input_tokens?: number;
          output_tokens?: number;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          date?: string;
          messages_count?: number;
          input_tokens?: number;
          output_tokens?: number;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string | null;
          type: string;
          channel: NotificationChannel;
          status: NotificationStatus;
          content: Json;
          scheduled_for: string | null;
          sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          type: string;
          channel: NotificationChannel;
          status?: NotificationStatus;
          content: Json;
          scheduled_for?: string | null;
          sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          type?: string;
          channel?: NotificationChannel;
          status?: NotificationStatus;
          content?: Json;
          scheduled_for?: string | null;
          sent_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      notification_preferences: {
        Row: {
          id: string;
          user_id: string | null;
          preferred_channels: Json;
          quiet_hours_start: string | null;
          quiet_hours_end: string | null;
          per_type_settings: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          preferred_channels?: Json;
          quiet_hours_start?: string | null;
          quiet_hours_end?: string | null;
          per_type_settings?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          preferred_channels?: Json;
          quiet_hours_start?: string | null;
          quiet_hours_end?: string | null;
          per_type_settings?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      blog_posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          content: string;
          excerpt: string | null;
          author_id: string | null;
          status: BlogPostStatus;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          content: string;
          excerpt?: string | null;
          author_id?: string | null;
          status?: BlogPostStatus;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          content?: string;
          excerpt?: string | null;
          author_id?: string | null;
          status?: BlogPostStatus;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
