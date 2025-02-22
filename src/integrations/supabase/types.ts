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
      corep_counterparties: {
        Row: {
          counterparty_id: number
          counterparty_name: string
          country: string | null
          lei_code: string | null
          sector: string | null
        }
        Insert: {
          counterparty_id?: number
          counterparty_name: string
          country?: string | null
          lei_code?: string | null
          sector?: string | null
        }
        Update: {
          counterparty_id?: number
          counterparty_name?: string
          country?: string | null
          lei_code?: string | null
          sector?: string | null
        }
        Relationships: []
      }
      corep_exposure_details: {
        Row: {
          collateral_value: number | null
          crm_technique: string | null
          exposure_detail_id: number
          exposure_id: number
          exposure_value: number | null
          product_type: string | null
          risk_weight: number | null
        }
        Insert: {
          collateral_value?: number | null
          crm_technique?: string | null
          exposure_detail_id?: number
          exposure_id: number
          exposure_value?: number | null
          product_type?: string | null
          risk_weight?: number | null
        }
        Update: {
          collateral_value?: number | null
          crm_technique?: string | null
          exposure_detail_id?: number
          exposure_id?: number
          exposure_value?: number | null
          product_type?: string | null
          risk_weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "corep_exposure_details_exposure_id_fkey"
            columns: ["exposure_id"]
            isOneToOne: false
            referencedRelation: "corep_exposures"
            referencedColumns: ["exposure_id"]
          },
        ]
      }
      corep_exposures: {
        Row: {
          counterparty_id: number
          exposure_amount: number
          exposure_currency: string
          exposure_date: string
          exposure_id: number
          exposure_type: string | null
          institution_id: number
          risk_mitigation: string | null
        }
        Insert: {
          counterparty_id: number
          exposure_amount: number
          exposure_currency: string
          exposure_date: string
          exposure_id?: number
          exposure_type?: string | null
          institution_id: number
          risk_mitigation?: string | null
        }
        Update: {
          counterparty_id?: number
          exposure_amount?: number
          exposure_currency?: string
          exposure_date?: string
          exposure_id?: number
          exposure_type?: string | null
          institution_id?: number
          risk_mitigation?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "corep_exposures_counterparty_id_fkey"
            columns: ["counterparty_id"]
            isOneToOne: false
            referencedRelation: "corep_counterparties"
            referencedColumns: ["counterparty_id"]
          },
          {
            foreignKeyName: "corep_exposures_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "corep_institutions"
            referencedColumns: ["institution_id"]
          },
        ]
      }
      corep_institutions: {
        Row: {
          country: string | null
          institution_id: number
          institution_name: string
          lei_code: string | null
          reporting_currency: string
          reporting_date: string
        }
        Insert: {
          country?: string | null
          institution_id?: number
          institution_name: string
          lei_code?: string | null
          reporting_currency: string
          reporting_date: string
        }
        Update: {
          country?: string | null
          institution_id?: number
          institution_name?: string
          lei_code?: string | null
          reporting_currency?: string
          reporting_date?: string
        }
        Relationships: []
      }
      corep_large_exposures: {
        Row: {
          comments: string | null
          exposure_id: number
          large_exposure_id: number
          limit_breach_flag: boolean | null
          limit_reference: string | null
        }
        Insert: {
          comments?: string | null
          exposure_id: number
          large_exposure_id?: number
          limit_breach_flag?: boolean | null
          limit_reference?: string | null
        }
        Update: {
          comments?: string | null
          exposure_id?: number
          large_exposure_id?: number
          limit_breach_flag?: boolean | null
          limit_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "corep_large_exposures_exposure_id_fkey"
            columns: ["exposure_id"]
            isOneToOne: false
            referencedRelation: "corep_exposures"
            referencedColumns: ["exposure_id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
