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
      app_categories: {
        Row: {
          app_store_category: string
          created_at: string
          id: string
          skreenlab_tag: string
          updated_at: string
          usage_note: string | null
        }
        Insert: {
          app_store_category: string
          created_at?: string
          id?: string
          skreenlab_tag: string
          updated_at?: string
          usage_note?: string | null
        }
        Update: {
          app_store_category?: string
          created_at?: string
          id?: string
          skreenlab_tag?: string
          updated_at?: string
          usage_note?: string | null
        }
        Relationships: []
      }
      apps: {
        Row: {
          app_store_url: string | null
          bundle_id: string | null
          category_id: string | null
          created_at: string
          description: string | null
          icon_url: string | null
          id: string
          name: string
          play_store_url: string | null
          updated_at: string
        }
        Insert: {
          app_store_url?: string | null
          bundle_id?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          name: string
          play_store_url?: string | null
          updated_at?: string
        }
        Update: {
          app_store_url?: string | null
          bundle_id?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          name?: string
          play_store_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "apps_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "app_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      screen_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      screenshots: {
        Row: {
          app_id: string | null
          app_version: string | null
          created_at: string
          device_type: string | null
          height: number | null
          id: string
          image_url: string
          is_analyzed: boolean | null
          metadata: Json | null
          notes: string | null
          os_version: string | null
          screen_category_id: string | null
          storage_path: string | null
          updated_at: string
          width: number | null
        }
        Insert: {
          app_id?: string | null
          app_version?: string | null
          created_at?: string
          device_type?: string | null
          height?: number | null
          id?: string
          image_url: string
          is_analyzed?: boolean | null
          metadata?: Json | null
          notes?: string | null
          os_version?: string | null
          screen_category_id?: string | null
          storage_path?: string | null
          updated_at?: string
          width?: number | null
        }
        Update: {
          app_id?: string | null
          app_version?: string | null
          created_at?: string
          device_type?: string | null
          height?: number | null
          id?: string
          image_url?: string
          is_analyzed?: boolean | null
          metadata?: Json | null
          notes?: string | null
          os_version?: string | null
          screen_category_id?: string | null
          storage_path?: string | null
          updated_at?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "screenshots_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "screenshots_screen_category_id_fkey"
            columns: ["screen_category_id"]
            isOneToOne: false
            referencedRelation: "screen_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      ui_element_types: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ui_elements: {
        Row: {
          bounding_box: Json
          confidence: number | null
          created_at: string
          element_type: string
          id: string
          metadata: Json | null
          screenshot_id: string | null
          text_content: string | null
          updated_at: string
        }
        Insert: {
          bounding_box: Json
          confidence?: number | null
          created_at?: string
          element_type: string
          id?: string
          metadata?: Json | null
          screenshot_id?: string | null
          text_content?: string | null
          updated_at?: string
        }
        Update: {
          bounding_box?: Json
          confidence?: number | null
          created_at?: string
          element_type?: string
          id?: string
          metadata?: Json | null
          screenshot_id?: string | null
          text_content?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ui_elements_screenshot_id_fkey"
            columns: ["screenshot_id"]
            isOneToOne: false
            referencedRelation: "screenshots"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_app_screenshots: {
        Args: { app_id_param: string }
        Returns: {
          id: string
          image_url: string
          screen_category: string
          width: number
          height: number
          created_at: string
        }[]
      }
      get_category_screenshots: {
        Args: { category_name: string }
        Returns: {
          id: string
          image_url: string
          app_name: string
          width: number
          height: number
          created_at: string
        }[]
      }
      get_screenshot_details: {
        Args: { screenshot_id: string }
        Returns: {
          id: string
          image_url: string
          app_name: string
          app_icon: string
          screen_category: string
          width: number
          height: number
          device_type: string
          created_at: string
          ui_element_count: number
        }[]
      }
      search_screenshots: {
        Args: { search_term: string }
        Returns: {
          id: string
          image_url: string
          app_name: string
          screen_category: string
          created_at: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
