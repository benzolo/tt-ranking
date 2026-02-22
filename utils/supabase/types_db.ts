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
      clubs: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          age_category: string
          created_at: string | null
          date: string
          gender: string
          has_csapat: boolean
          has_egyes: boolean
          has_paros: boolean
          has_vegyes: boolean
          id: string
          name: string
          type: string
          updated_at: string | null
          validity_date: string
        }
        Insert: {
          age_category: string
          created_at?: string | null
          date: string
          gender?: string
          has_csapat?: boolean
          has_egyes?: boolean
          has_paros?: boolean
          has_vegyes?: boolean
          id?: string
          name: string
          type: string
          updated_at?: string | null
          validity_date: string
        }
        Update: {
          age_category?: string
          created_at?: string | null
          date?: string
          gender?: string
          has_csapat?: boolean
          has_egyes?: boolean
          has_paros?: boolean
          has_vegyes?: boolean
          id?: string
          name?: string
          type?: string
          updated_at?: string | null
          validity_date?: string
        }
        Relationships: []
      }
      players: {
        Row: {
          birth_date: string | null
          club_id: string | null
          created_at: string | null
          gender: string
          id: string
          license_id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          birth_date?: string | null
          club_id?: string | null
          created_at?: string | null
          gender: string
          id?: string
          license_id: string
          name: string
          updated_at?: string | null
        }
        Update: {
          birth_date?: string | null
          club_id?: string | null
          created_at?: string | null
          gender?: string
          id?: string
          license_id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "players_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      point_table: {
        Row: {
          category: string
          created_at: string | null
          event_type: string
          id: string
          points: number
          position: string
        }
        Insert: {
          category: string
          created_at?: string | null
          event_type: string
          id?: string
          points: number
          position: string
        }
        Update: {
          category?: string
          created_at?: string | null
          event_type?: string
          id?: string
          points?: number
          position?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          role: string
          updated_at: string | null
        }
        Insert: {
          id: string
          role?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ranking_snapshots: {
        Row: {
          created_at: string | null
          events_count: number
          id: string
          metadata_id: string | null
          player_id: string | null
          rank_position: number
          snapshot_date: string
          total_points: number
        }
        Insert: {
          created_at?: string | null
          events_count: number
          id?: string
          metadata_id?: string | null
          player_id?: string | null
          rank_position: number
          snapshot_date: string
          total_points: number
        }
        Update: {
          created_at?: string | null
          events_count?: number
          id?: string
          metadata_id?: string | null
          player_id?: string | null
          rank_position?: number
          snapshot_date?: string
          total_points?: number
        }
        Relationships: [
          {
            foreignKeyName: "ranking_snapshots_metadata_id_fkey"
            columns: ["metadata_id"]
            isOneToOne: false
            referencedRelation: "snapshot_metadata"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ranking_snapshots_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      results: {
        Row: {
          category: string
          created_at: string | null
          event_id: string
          id: string
          player_id: string
          points: number
          position: string
          updated_at: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          event_id: string
          id?: string
          player_id: string
          points?: number
          position: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          event_id?: string
          id?: string
          player_id?: string
          points?: number
          position?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "results_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "results_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      snapshot_metadata: {
        Row: {
          age_category: string | null
          created_at: string | null
          description: string | null
          gender: string | null
          id: string
          is_public: boolean | null
          name: string | null
          snapshot_date: string
        }
        Insert: {
          age_category?: string | null
          created_at?: string | null
          description?: string | null
          gender?: string | null
          id?: string
          is_public?: boolean | null
          name?: string | null
          snapshot_date: string
        }
        Update: {
          age_category?: string | null
          created_at?: string | null
          description?: string | null
          gender?: string | null
          id?: string
          is_public?: boolean | null
          name?: string | null
          snapshot_date?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
