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
      app_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      items: {
        Row: {
          created_at: string
          id: string
          item_code: string
          item_type: Database["public"]["Enums"]["item_type"]
          language: Database["public"]["Enums"]["item_language"] | null
          school_id: string
          status: Database["public"]["Enums"]["item_status"]
        }
        Insert: {
          created_at?: string
          id?: string
          item_code: string
          item_type: Database["public"]["Enums"]["item_type"]
          language?: Database["public"]["Enums"]["item_language"] | null
          school_id: string
          status?: Database["public"]["Enums"]["item_status"]
        }
        Update: {
          created_at?: string
          id?: string
          item_code?: string
          item_type?: Database["public"]["Enums"]["item_type"]
          language?: Database["public"]["Enums"]["item_language"] | null
          school_id?: string
          status?: Database["public"]["Enums"]["item_status"]
        }
        Relationships: [
          {
            foreignKeyName: "items_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          category: Database["public"]["Enums"]["school_category"]
          created_at: string
          id: string
          phone_number: string
          school_name: string
          teacher_name: string
          total_items: number
        }
        Insert: {
          category: Database["public"]["Enums"]["school_category"]
          created_at?: string
          id?: string
          phone_number: string
          school_name: string
          teacher_name: string
          total_items?: number
        }
        Update: {
          category?: Database["public"]["Enums"]["school_category"]
          created_at?: string
          id?: string
          phone_number?: string
          school_name?: string
          teacher_name?: string
          total_items?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_school_exists:
        | { Args: { school_name_param: string }; Returns: boolean }
        | {
            Args: { category_param?: string; school_name_param: string }
            Returns: boolean
          }
      get_admin_users: {
        Args: never
        Returns: {
          created_at: string
          email: string
          role: string
          user_id: string
        }[]
      }
      get_registered_school_names: {
        Args: never
        Returns: {
          category: string
          school_name: string
        }[]
      }
      is_admin: { Args: { check_user_id: string }; Returns: boolean }
      is_super_admin: { Args: { check_user_id: string }; Returns: boolean }
      normalize_school_name: { Args: { name: string }; Returns: string }
    }
    Enums: {
      item_language: "English" | "French" | "German"
      item_status:
        | "Registered"
        | "Files Submitted"
        | "Under Review"
        | "Adjudicated"
      item_type:
        | "Choral Verse"
        | "Play"
        | "Spoken Word"
        | "Solo Verse"
        | "Modern Dance"
        | "Comedy"
        | "Live Broadcast"
        | "Podcast"
        | "Singing Games"
        | "Narratives"
        | "Cultural Creative Dance"
        | "Video Song"
        | "Documentary"
        | "Advert"
        | "Features"
        | "Screen Solo"
      school_category:
        | "Pre School"
        | "Lower Grade"
        | "Primary"
        | "Junior School"
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
      item_language: ["English", "French", "German"],
      item_status: [
        "Registered",
        "Files Submitted",
        "Under Review",
        "Adjudicated",
      ],
      item_type: [
        "Choral Verse",
        "Play",
        "Spoken Word",
        "Solo Verse",
        "Modern Dance",
        "Comedy",
        "Live Broadcast",
        "Podcast",
        "Singing Games",
        "Narratives",
        "Cultural Creative Dance",
        "Video Song",
        "Documentary",
        "Advert",
        "Features",
        "Screen Solo",
      ],
      school_category: [
        "Pre School",
        "Lower Grade",
        "Primary",
        "Junior School",
      ],
    },
  },
} as const
