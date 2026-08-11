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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      ai_rules: {
        Row: {
          id: string
          is_active: boolean
          sort_order: number
          text: string
          updated_at: string
        }
        Insert: {
          id?: string
          is_active?: boolean
          sort_order?: number
          text: string
          updated_at?: string
        }
        Update: {
          id?: string
          is_active?: boolean
          sort_order?: number
          text?: string
          updated_at?: string
        }
        Relationships: []
      }
      assessment_results: {
        Row: {
          area: string
          aspects: Json
          created_at: string
          exercise_ids: Json
          factors: Json
          id: string
          intensity: number
          recommendations: Json
          related: Json
          session_id: string | null
          summary: string | null
          triage: string
          user_id: string
        }
        Insert: {
          area: string
          aspects?: Json
          created_at?: string
          exercise_ids?: Json
          factors?: Json
          id?: string
          intensity?: number
          recommendations?: Json
          related?: Json
          session_id?: string | null
          summary?: string | null
          triage: string
          user_id: string
        }
        Update: {
          area?: string
          aspects?: Json
          created_at?: string
          exercise_ids?: Json
          factors?: Json
          id?: string
          intensity?: number
          recommendations?: Json
          related?: Json
          session_id?: string | null
          summary?: string | null
          triage?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_results_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "questionnaire_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      consultation_requests: {
        Row: {
          area: string | null
          contact: string | null
          created_at: string
          id: string
          message: string | null
          status: string
          triage: string | null
          user_id: string
        }
        Insert: {
          area?: string | null
          contact?: string | null
          created_at?: string
          id?: string
          message?: string | null
          status?: string
          triage?: string | null
          user_id: string
        }
        Update: {
          area?: string | null
          contact?: string | null
          created_at?: string
          id?: string
          message?: string | null
          status?: string
          triage?: string | null
          user_id?: string
        }
        Relationships: []
      }
      content: {
        Row: {
          access_level: string
          ai_allowed: boolean
          category_id: string | null
          created_at: string
          description: string
          duration_minutes: number | null
          id: string
          image_url: string | null
          is_active: boolean
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          access_level?: string
          ai_allowed?: boolean
          category_id?: string | null
          created_at?: string
          description?: string
          duration_minutes?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          access_level?: string
          ai_allowed?: boolean
          category_id?: string | null
          created_at?: string
          description?: string
          duration_minutes?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "content_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      content_bodies: {
        Row: {
          body: string
          content_id: string
        }
        Insert: {
          body?: string
          content_id: string
        }
        Update: {
          body?: string
          content_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_bodies_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: true
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
        ]
      }
      content_categories: {
        Row: {
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      content_completions: {
        Row: {
          content_id: string
          id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          content_id: string
          id?: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          content_id?: string
          id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_completions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          area: string | null
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          area?: string | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          area?: string | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      exercise_completions: {
        Row: {
          created_at: string
          exercise_slug: string
          id: string
          note: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          exercise_slug: string
          id?: string
          note?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          exercise_slug?: string
          id?: string
          note?: string | null
          user_id?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          ai_allowed: boolean
          areas: Json
          category: string
          created_at: string
          description: string
          id: string
          instructions: Json
          is_active: boolean
          minutes: number
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          ai_allowed?: boolean
          areas?: Json
          category: string
          created_at?: string
          description?: string
          id?: string
          instructions?: Json
          is_active?: boolean
          minutes?: number
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          ai_allowed?: boolean
          areas?: Json
          category?: string
          created_at?: string
          description?: string
          id?: string
          instructions?: Json
          is_active?: boolean
          minutes?: number
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          preferences: Json
          selected_area: string | null
          subscription_end: string | null
          subscription_start: string | null
          subscription_status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          preferences?: Json
          selected_area?: string | null
          subscription_end?: string | null
          subscription_start?: string | null
          subscription_status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          preferences?: Json
          selected_area?: string | null
          subscription_end?: string | null
          subscription_start?: string | null
          subscription_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          access_level: string
          category_id: string | null
          created_at: string
          description: string
          duration_label: string | null
          id: string
          is_active: boolean
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          access_level?: string
          category_id?: string | null
          created_at?: string
          description?: string
          duration_label?: string | null
          id?: string
          is_active?: boolean
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          access_level?: string
          category_id?: string | null
          created_at?: string
          description?: string
          duration_label?: string | null
          id?: string
          is_active?: boolean
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "programs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "content_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      program_enrollments: {
        Row: {
          id: string
          program_id: string
          started_at: string
          user_id: string
        }
        Insert: {
          id?: string
          program_id: string
          started_at?: string
          user_id: string
        }
        Update: {
          id?: string
          program_id?: string
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_enrollments_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      program_session_completions: {
        Row: {
          completed_at: string
          id: string
          program_session_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          program_session_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          program_session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_session_completions_program_session_id_fkey"
            columns: ["program_session_id"]
            isOneToOne: false
            referencedRelation: "program_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      program_sessions: {
        Row: {
          content_id: string | null
          exercise_id: string | null
          id: string
          program_id: string
          sort_order: number
          title: string
        }
        Insert: {
          content_id?: string | null
          exercise_id?: string | null
          id?: string
          program_id: string
          sort_order?: number
          title: string
        }
        Update: {
          content_id?: string | null
          exercise_id?: string | null
          id?: string
          program_id?: string
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_sessions_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_sessions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_sessions_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      question_options: {
        Row: {
          id: string
          label: string
          question_id: string
          sort_order: number
          value: number
        }
        Insert: {
          id?: string
          label: string
          question_id: string
          sort_order?: number
          value?: number
        }
        Update: {
          id?: string
          label?: string
          question_id?: string
          sort_order?: number
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaire_answers: {
        Row: {
          created_at: string
          id: string
          question_slug: string
          session_id: string
          user_id: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          question_slug: string
          session_id: string
          user_id: string
          value: Json
        }
        Update: {
          created_at?: string
          id?: string
          question_slug?: string
          session_id?: string
          user_id?: string
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "questionnaire_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaire_sessions: {
        Row: {
          area: string
          completed_at: string | null
          created_at: string
          current_step: number
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          area: string
          completed_at?: string | null
          created_at?: string
          current_step?: number
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          area?: string
          completed_at?: string | null
          created_at?: string
          current_step?: number
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          alarm_at: number | null
          answer_type: string
          area: string
          created_at: string
          factor: string
          help: string | null
          id: string
          is_active: boolean
          slug: string
          sort_order: number
          step: number
          title: string
          updated_at: string
        }
        Insert: {
          alarm_at?: number | null
          answer_type?: string
          area: string
          created_at?: string
          factor: string
          help?: string | null
          id?: string
          is_active?: boolean
          slug: string
          sort_order?: number
          step?: number
          title: string
          updated_at?: string
        }
        Update: {
          alarm_at?: number | null
          answer_type?: string
          area?: string
          created_at?: string
          factor?: string
          help?: string | null
          id?: string
          is_active?: boolean
          slug?: string
          sort_order?: number
          step?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          area: string
          id: string
          is_active: boolean
          sort_order: number
          text: string
          triage: string | null
          updated_at: string
        }
        Insert: {
          area: string
          id?: string
          is_active?: boolean
          sort_order?: number
          text: string
          triage?: string | null
          updated_at?: string
        }
        Update: {
          area?: string
          id?: string
          is_active?: boolean
          sort_order?: number
          text?: string
          triage?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      risk_rules: {
        Row: {
          description: string | null
          guidance: string | null
          id: string
          is_active: boolean
          max_intensity: number | null
          min_intensity: number | null
          name: string
          requires_alarm: boolean
          sort_order: number
          triage: string
          updated_at: string
        }
        Insert: {
          description?: string | null
          guidance?: string | null
          id?: string
          is_active?: boolean
          max_intensity?: number | null
          min_intensity?: number | null
          name: string
          requires_alarm?: boolean
          sort_order?: number
          triage: string
          updated_at?: string
        }
        Update: {
          description?: string | null
          guidance?: string | null
          id?: string
          is_active?: boolean
          max_intensity?: number | null
          min_intensity?: number | null
          name?: string
          requires_alarm?: boolean
          sort_order?: number
          triage?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          provider: string
          provider_customer_id: string | null
          provider_subscription_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          provider?: string
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          provider?: string
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_premium: {
        Args: {
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
