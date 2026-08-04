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
      action_logs: {
        Row: {
          action_result: string
          action_type: string
          button_id: string | null
          created_at: string
          error_message: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          module_name: string
          response_time_ms: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_result: string
          action_type: string
          button_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          module_name: string
          response_time_ms?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_result?: string
          action_type?: string
          button_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          module_name?: string
          response_time_ms?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          id: string
          meta_json: Json | null
          module: string
          role: Database["public"]["Enums"]["app_role"] | null
          timestamp: string
          user_id: string | null
        }
        Insert: {
          action: string
          id?: string
          meta_json?: Json | null
          module: string
          role?: Database["public"]["Enums"]["app_role"] | null
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          id?: string
          meta_json?: Json | null
          module?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      developer_tasks: {
        Row: {
          accepted_at: string | null
          assigned_by: string | null
          blocked_reason: string | null
          blocked_since: string | null
          buzzer_acknowledged_at: string | null
          buzzer_active: boolean
          category: string
          client_id: string | null
          completed_at: string | null
          created_at: string
          deadline: string | null
          delivery_notes: string | null
          description: string | null
          developer_id: string | null
          escalate_threshold_hours: number
          estimated_hours: number | null
          id: string
          masked_client_info: Json | null
          max_delivery_hours: number | null
          pause_reason: string | null
          paused_at: string | null
          priority: string
          promise_id: string | null
          promised_at: string | null
          quality_score: number | null
          started_at: string | null
          status: string
          tech_stack: string[]
          title: string
          total_paused_minutes: number
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          assigned_by?: string | null
          blocked_reason?: string | null
          blocked_since?: string | null
          buzzer_acknowledged_at?: string | null
          buzzer_active?: boolean
          category: string
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          delivery_notes?: string | null
          description?: string | null
          developer_id?: string | null
          escalate_threshold_hours?: number
          estimated_hours?: number | null
          id?: string
          masked_client_info?: Json | null
          max_delivery_hours?: number | null
          pause_reason?: string | null
          paused_at?: string | null
          priority?: string
          promise_id?: string | null
          promised_at?: string | null
          quality_score?: number | null
          started_at?: string | null
          status?: string
          tech_stack?: string[]
          title: string
          total_paused_minutes?: number
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          assigned_by?: string | null
          blocked_reason?: string | null
          blocked_since?: string | null
          buzzer_acknowledged_at?: string | null
          buzzer_active?: boolean
          category?: string
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          delivery_notes?: string | null
          description?: string | null
          developer_id?: string | null
          escalate_threshold_hours?: number
          estimated_hours?: number | null
          id?: string
          masked_client_info?: Json | null
          max_delivery_hours?: number | null
          pause_reason?: string | null
          paused_at?: string | null
          priority?: string
          promise_id?: string | null
          promised_at?: string | null
          quality_score?: number | null
          started_at?: string | null
          status?: string
          tech_stack?: string[]
          title?: string
          total_paused_minutes?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "developer_tasks_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: false
            referencedRelation: "developers"
            referencedColumns: ["id"]
          },
        ]
      }
      developers: {
        Row: {
          availability: string
          created_at: string
          email: string
          full_name: string
          id: string
          joined_at: string | null
          max_capacity: number
          onboarding_completed: boolean
          skill_tags: string[]
          status: string
          updated_at: string
          user_id: string | null
          vala_id: string | null
        }
        Insert: {
          availability?: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          joined_at?: string | null
          max_capacity?: number
          onboarding_completed?: boolean
          skill_tags?: string[]
          status?: string
          updated_at?: string
          user_id?: string | null
          vala_id?: string | null
        }
        Update: {
          availability?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          joined_at?: string | null
          max_capacity?: number
          onboarding_completed?: boolean
          skill_tags?: string[]
          status?: string
          updated_at?: string
          user_id?: string | null
          vala_id?: string | null
        }
        Relationships: []
      }
      escalations: {
        Row: {
          auto_escalated: boolean
          created_at: string
          escalated_by: string | null
          escalated_to: string
          id: string
          reason: string
          resolution: string | null
          resolved_at: string | null
          status: string
          task_id: string | null
          updated_at: string
        }
        Insert: {
          auto_escalated?: boolean
          created_at?: string
          escalated_by?: string | null
          escalated_to?: string
          id?: string
          reason: string
          resolution?: string | null
          resolved_at?: string | null
          status?: string
          task_id?: string | null
          updated_at?: string
        }
        Update: {
          auto_escalated?: boolean
          created_at?: string
          escalated_by?: string | null
          escalated_to?: string
          id?: string
          reason?: string
          resolution?: string | null
          resolved_at?: string | null
          status?: string
          task_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "escalations_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "developer_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_internal_notes: {
        Row: {
          author_id: string | null
          author_label: string | null
          content: string
          created_at: string
          id: string
          task_id: string | null
        }
        Insert: {
          author_id?: string | null
          author_label?: string | null
          content: string
          created_at?: string
          id?: string
          task_id?: string | null
        }
        Update: {
          author_id?: string | null
          author_label?: string | null
          content?: string
          created_at?: string
          id?: string
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_internal_notes_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "developer_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          approval_status: string
          created_at: string
          force_logged_out_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          approval_status?: string
          created_at?: string
          force_logged_out_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          approval_status?: string
          created_at?: string
          force_logged_out_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_force_logout: { Args: { check_user_id: string }; Returns: boolean }
      clear_force_logout: {
        Args: { clear_user_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_dev_manager: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "boss_owner"
        | "ceo"
        | "prime"
        | "dev_manager"
        | "developer"
        | "client"
        | "franchise"
        | "reseller"
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
      app_role: [
        "boss_owner",
        "ceo",
        "prime",
        "dev_manager",
        "developer",
        "client",
        "franchise",
        "reseller",
      ],
    },
  },
} as const
