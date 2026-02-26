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
      matches: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          unmatched_at: string | null
          unmatched_by: string | null
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          unmatched_at?: string | null
          unmatched_by?: string | null
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          unmatched_at?: string | null
          unmatched_by?: string | null
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          match_id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          match_id: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          match_id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          about_children: string | null
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          christian_interests: string[] | null
          church_frequency: string | null
          city: string | null
          created_at: string
          display_name: string | null
          drink: string | null
          education: string | null
          gender: string | null
          id: string
          is_active: boolean | null
          is_boosted: boolean | null
          is_profile_complete: boolean | null
          is_verified: boolean | null
          languages: string[] | null
          last_active_at: string | null
          latitude: number | null
          longitude: number | null
          looking_for: string | null
          occupation: string | null
          pets: string | null
          photos: string[] | null
          physical_activity: string | null
          religion: string | null
          show_distance: boolean | null
          show_last_active: boolean | null
          show_online_status: boolean | null
          show_read_receipts: boolean | null
          smoke: string | null
          social_media: string | null
          state: string | null
          suspended_until: string | null
          updated_at: string
          user_id: string
          values_importance: string | null
        }
        Insert: {
          about_children?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          christian_interests?: string[] | null
          church_frequency?: string | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          drink?: string | null
          education?: string | null
          gender?: string | null
          id?: string
          is_active?: boolean | null
          is_boosted?: boolean | null
          is_profile_complete?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          last_active_at?: string | null
          latitude?: number | null
          longitude?: number | null
          looking_for?: string | null
          occupation?: string | null
          pets?: string | null
          photos?: string[] | null
          physical_activity?: string | null
          religion?: string | null
          show_distance?: boolean | null
          show_last_active?: boolean | null
          show_online_status?: boolean | null
          show_read_receipts?: boolean | null
          smoke?: string | null
          social_media?: string | null
          state?: string | null
          suspended_until?: string | null
          updated_at?: string
          values_importance?: string | null
        }
        Update: {
          about_children?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          christian_interests?: string[] | null
          church_frequency?: string | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          drink?: string | null
          education?: string | null
          gender?: string | null
          id?: string
          is_active?: boolean | null
          is_boosted?: boolean | null
          is_profile_complete?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          last_active_at?: string | null
          latitude?: number | null
          longitude?: number | null
          looking_for?: string | null
          occupation?: string | null
          pets?: string | null
          photos?: string[] | null
          physical_activity?: string | null
          religion?: string | null
          show_distance?: boolean | null
          show_last_active?: boolean | null
          show_online_status?: boolean | null
          show_read_receipts?: boolean | null
          smoke?: string | null
          social_media?: string | null
          state?: string | null
          suspended_until?: string | null
          updated_at?: string
          values_importance?: string | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          created_at: string
          id: string
          order_bumps: Json | null
          payment_id: string | null
          payment_method: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          plan_id: string
          plan_name: string
          plan_price: number
          quiz_data: Json | null
          sck: string | null
          source_platform: string | null
          src: string | null
          total_price: number
          updated_at: string
          user_cpf: string | null
          user_email: string
          user_id: string | null
          user_name: string
          user_phone: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_bumps?: Json | null
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          plan_id: string
          plan_name: string
          plan_price: number
          quiz_data?: Json | null
          sck?: string | null
          source_platform?: string | null
          src?: string | null
          total_price: number
          updated_at?: string
          user_cpf?: string | null
          user_email: string
          user_id?: string | null
          user_name: string
          user_phone?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          order_bumps?: Json | null
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          plan_id?: string
          plan_name?: string
          plan_price?: number
          quiz_data?: Json | null
          sck?: string | null
          source_platform?: string | null
          src?: string | null
          total_price?: number
          updated_at?: string
          user_cpf?: string | null
          user_email?: string
          user_id?: string | null
          user_name?: string
          user_phone?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      seed_likes: {
        Row: {
          age_range: string
          city: string | null
          created_at: string
          id: string
          looking_for: string | null
          profile_index: number
          religion: string | null
          state_name: string | null
          status: string
          user_gender: string
          user_id: string
        }
        Insert: {
          age_range?: string
          city?: string | null
          created_at?: string
          id?: string
          looking_for?: string | null
          profile_index: number
          religion?: string | null
          state_name?: string | null
          status?: string
          user_gender?: string
          user_id: string
        }
        Update: {
          age_range?: string
          city?: string | null
          created_at?: string
          id?: string
          looking_for?: string | null
          profile_index?: number
          religion?: string | null
          state_name?: string | null
          status?: string
          user_gender?: string
          user_id?: string
        }
        Relationships: []
      }
      spatial_ref_sys: {

        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      swipes: {
        Row: {
          created_at: string
          direction: Database["public"]["Enums"]["swipe_direction"]
          id: string
          message: string | null
          swiped_id: string
          swiper_id: string
        }
        Insert: {
          created_at?: string
          direction: Database["public"]["Enums"]["swipe_direction"]
          id?: string
          message?: string | null
          swiped_id: string
          swiper_id: string
        }
        Update: {
          created_at?: string
          direction?: Database["public"]["Enums"]["swipe_direction"]
          id?: string
          message?: string | null
          swiped_id?: string
          swiper_id?: string
        }
        Relationships: []
      }
      user_blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      user_reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          reason: string
          reported_id: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reported_id: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reported_id?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
      user_subscriptions: {
        Row: {
          can_see_who_liked: boolean | null
          can_use_advanced_filters: boolean | null
          can_video_call: boolean | null
          created_at: string
          daily_swipes_limit: number | null
          expires_at: string | null
          has_all_regions: boolean | null
          has_grupo_catolico: boolean | null
          has_grupo_evangelico: boolean | null
          id: string
          is_active: boolean | null
          is_lifetime: boolean | null
          is_profile_boosted: boolean | null
          plan_id: string
          plan_name: string
          purchase_id: string | null
          starts_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          can_see_who_liked?: boolean | null
          can_use_advanced_filters?: boolean | null
          can_video_call?: boolean | null
          created_at?: string
          daily_swipes_limit?: number | null
          expires_at?: string | null
          has_all_regions?: boolean | null
          has_grupo_catolico?: boolean | null
          has_grupo_evangelico?: boolean | null
          id?: string
          is_active?: boolean | null
          is_lifetime?: boolean | null
          is_profile_boosted?: boolean | null
          plan_id: string
          plan_name: string
          purchase_id?: string | null
          starts_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          can_see_who_liked?: boolean | null
          can_use_advanced_filters?: boolean | null
          can_video_call?: boolean | null
          created_at?: string
          daily_swipes_limit?: number | null
          expires_at?: string | null
          has_all_regions?: boolean | null
          has_grupo_catolico?: boolean | null
          has_grupo_evangelico?: boolean | null
          id?: string
          is_active?: boolean | null
          is_lifetime?: boolean | null
          is_profile_boosted?: boolean | null
          plan_id?: string
          plan_name?: string
          purchase_id?: string | null
          starts_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_swiped_bots_count: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_profiles_discovery: {
        Args: {
          p_user_id: string
          p_gender: string
          p_target_gender: string
          p_min_age?: number
          p_max_age?: number
          p_state?: string
          p_city?: string
          p_religion?: string
          p_church_frequency?: string
          p_looking_for?: string
          p_christian_interests?: string[]
          p_has_photos?: boolean
          p_is_verified?: boolean
          p_online_recently?: boolean
          p_max_distance?: number
          p_latitude?: number
          p_longitude?: number
          p_fallback_state?: string
          p_fallback_city?: string
          p_limit?: number
          p_offset?: number
        }
        Returns: unknown[]
      }
      activate_whatsapp_invite: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      payment_status: "PENDING" | "PAID" | "FAILED" | "REFUNDED"
      swipe_direction: "like" | "dislike" | "super_like"
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
      app_role: ["admin", "moderator", "user"],
      payment_status: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      swipe_direction: ["like", "dislike", "super_like"],
    },
  },
} as const
