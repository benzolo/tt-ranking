export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      events: {
        Row: {
          age_category: string
          category: string
          created_at: string | null
          date: string
          id: string
          name: string
          type: string
          updated_at: string | null
          validity_date: string
        }
        Insert: {
          age_category: string
          category: string
          created_at?: string | null
          date: string
          id?: string
          name: string
          type: string
          updated_at?: string | null
          validity_date: string
        }
        Update: {
          age_category?: string
          category?: string
          created_at?: string | null
          date?: string
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
          club: string | null
          created_at: string | null
          gender: string
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          birth_date?: string | null
          club?: string | null
          created_at?: string | null
          gender: string
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          birth_date?: string | null
          club?: string | null
          created_at?: string | null
          gender?: string
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      point_table: {
        Row: {
          category: string
          created_at: string | null
          event_type: string
          id: string
          points: number
          position: number
        }
        Insert: {
          category: string
          created_at?: string | null
          event_type: string
          id?: string
          points: number
          position: number
        }
        Update: {
          category?: string
          created_at?: string | null
          event_type?: string
          id?: string
          points?: number
          position?: number
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
      results: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          player_id: string
          points: number
          position: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          player_id: string
          points?: number
          position: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          player_id?: string
          points?: number
          position?: number
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
