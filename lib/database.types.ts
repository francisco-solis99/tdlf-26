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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      doubles: {
        Row: {
          category_id: string
          created_at: string
          group_id: string | null
          id: string
          player1_id: string
          player2_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          group_id?: string | null
          id?: string
          player1_id: string
          player2_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          group_id?: string | null
          id?: string
          player1_id?: string
          player2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "doubles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doubles_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group_progress"
            referencedColumns: ["group_id"]
          },
          {
            foreignKeyName: "doubles_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doubles_player1_id_fkey"
            columns: ["player1_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doubles_player2_id_fkey"
            columns: ["player2_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          category_id: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string
          double1_id: string
          double2_id: string
          group_id: string | null
          id: string
          played_at: string | null
          score1: number | null
          score2: number | null
          stage: Database["public"]["Enums"]["match_stage"]
          winner_double_id: string | null
        }
        Insert: {
          created_at?: string
          double1_id: string
          double2_id: string
          group_id?: string | null
          id?: string
          played_at?: string | null
          score1?: number | null
          score2?: number | null
          stage?: Database["public"]["Enums"]["match_stage"]
          winner_double_id?: string | null
        }
        Update: {
          created_at?: string
          double1_id?: string
          double2_id?: string
          group_id?: string | null
          id?: string
          played_at?: string | null
          score1?: number | null
          score2?: number | null
          stage?: Database["public"]["Enums"]["match_stage"]
          winner_double_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_double1_id_fkey"
            columns: ["double1_id"]
            isOneToOne: false
            referencedRelation: "double_status"
            referencedColumns: ["double_id"]
          },
          {
            foreignKeyName: "matches_double1_id_fkey"
            columns: ["double1_id"]
            isOneToOne: false
            referencedRelation: "doubles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_double1_id_fkey"
            columns: ["double1_id"]
            isOneToOne: false
            referencedRelation: "group_standings"
            referencedColumns: ["double_id"]
          },
          {
            foreignKeyName: "matches_double2_id_fkey"
            columns: ["double2_id"]
            isOneToOne: false
            referencedRelation: "double_status"
            referencedColumns: ["double_id"]
          },
          {
            foreignKeyName: "matches_double2_id_fkey"
            columns: ["double2_id"]
            isOneToOne: false
            referencedRelation: "doubles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_double2_id_fkey"
            columns: ["double2_id"]
            isOneToOne: false
            referencedRelation: "group_standings"
            referencedColumns: ["double_id"]
          },
          {
            foreignKeyName: "matches_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group_progress"
            referencedColumns: ["group_id"]
          },
          {
            foreignKeyName: "matches_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_winner_double_id_fkey"
            columns: ["winner_double_id"]
            isOneToOne: false
            referencedRelation: "double_status"
            referencedColumns: ["double_id"]
          },
          {
            foreignKeyName: "matches_winner_double_id_fkey"
            columns: ["winner_double_id"]
            isOneToOne: false
            referencedRelation: "doubles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_winner_double_id_fkey"
            columns: ["winner_double_id"]
            isOneToOne: false
            referencedRelation: "group_standings"
            referencedColumns: ["double_id"]
          },
        ]
      }
      players: {
        Row: {
          age: number | null
          city: string | null
          created_at: string
          id: string
          name: string
          picture: string | null
        }
        Insert: {
          age?: number | null
          city?: string | null
          created_at?: string
          id?: string
          name: string
          picture?: string | null
        }
        Update: {
          age?: number | null
          city?: string | null
          created_at?: string
          id?: string
          name?: string
          picture?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          id: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
    }
    Views: {
      double_status: {
        Row: {
          double_id: string | null
          group_id: string | null
          group_rank: number | null
          group_stage_complete: boolean | null
          losses: number | null
          points_scored: number | null
          status: string | null
          wins: number | null
        }
        Relationships: [
          {
            foreignKeyName: "doubles_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group_progress"
            referencedColumns: ["group_id"]
          },
          {
            foreignKeyName: "doubles_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_progress: {
        Row: {
          expected_matches: number | null
          group_id: string | null
          group_stage_complete: boolean | null
          pairs_in_group: number | null
          played_matches: number | null
        }
        Relationships: []
      }
      group_standings: {
        Row: {
          double_id: string | null
          group_id: string | null
          group_rank: number | null
          losses: number | null
          points_scored: number | null
          wins: number | null
        }
        Relationships: [
          {
            foreignKeyName: "doubles_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group_progress"
            referencedColumns: ["group_id"]
          },
          {
            foreignKeyName: "doubles_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      create_groups_for_category: {
        Args: { p_category_id: string; p_group_count: number }
        Returns: undefined
      }
    }
    Enums: {
      match_stage:
        | "group"
        | "round_of_32"
        | "round_of_16"
        | "quarterfinal"
        | "semifinal"
        | "final"
      user_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      match_stage: [
        "group",
        "round_of_32",
        "round_of_16",
        "quarterfinal",
        "semifinal",
        "final",
      ],
      user_role: ["admin", "user"],
    },
  },
} as const
