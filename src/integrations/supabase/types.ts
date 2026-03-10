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
      abandoned_cart_coupons: {
        Row: {
          coupon_code: string
          coupon_id: string
          created_at: string
          id: string
          sent_at: string
          user_id: string
        }
        Insert: {
          coupon_code: string
          coupon_id: string
          created_at?: string
          id?: string
          sent_at?: string
          user_id: string
        }
        Update: {
          coupon_code?: string
          coupon_id?: string
          created_at?: string
          id?: string
          sent_at?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          label_ar: string
          label_en: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          label_ar: string
          label_en: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          label_ar?: string
          label_en?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_name: string
          id: string
          last_message_at: string
          order_id: string | null
          order_number: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_name: string
          id?: string
          last_message_at?: string
          order_id?: string | null
          order_number?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          id?: string
          last_message_at?: string
          order_id?: string | null
          order_number?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          attachment_type: string | null
          attachment_url: string | null
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          sender_id: string
          sender_type: string
        }
        Insert: {
          attachment_type?: string | null
          attachment_url?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          sender_id: string
          sender_type: string
        }
        Update: {
          attachment_type?: string | null
          attachment_url?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          sender_id?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          discount_percent: number
          expires_at: string | null
          id: string
          is_active: boolean | null
          is_personal: boolean | null
          user_id: string | null
        }
        Insert: {
          code: string
          created_at?: string
          discount_percent: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_personal?: boolean | null
          user_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          discount_percent?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_personal?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          created_at: string
          description_ar: string
          description_en: string
          expense_date: string
          id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          description_ar: string
          description_en: string
          expense_date?: string
          id?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description_ar?: string
          description_en?: string
          expense_date?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_points: {
        Row: {
          created_at: string
          id: string
          points: number
          total_earned: number
          total_redeemed: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points?: number
          total_earned?: number
          total_redeemed?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points?: number
          total_earned?: number
          total_redeemed?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          customer_address: string
          customer_name: string
          customer_phone: string
          id: string
          items: Json
          notes: string | null
          order_number: string
          payment_method: string
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_address: string
          customer_name: string
          customer_phone: string
          id?: string
          items: Json
          notes?: string | null
          order_number: string
          payment_method: string
          status?: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_address?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          items?: Json
          notes?: string | null
          order_number?: string
          payment_method?: string
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      page_content: {
        Row: {
          content_ar: string | null
          content_en: string | null
          created_at: string
          id: string
          image_url: string | null
          metadata: Json | null
          page_key: string
          title_ar: string | null
          title_en: string | null
          updated_at: string
        }
        Insert: {
          content_ar?: string | null
          content_en?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          metadata?: Json | null
          page_key: string
          title_ar?: string | null
          title_en?: string | null
          updated_at?: string
        }
        Update: {
          content_ar?: string | null
          content_en?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          metadata?: Json | null
          page_key?: string
          title_ar?: string | null
          title_en?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          logo_url: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          logo_url: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          logo_url?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      password_reset_otps: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          otp_code: string
          used: boolean | null
          user_email: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          otp_code: string
          used?: boolean | null
          user_email: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          otp_code?: string
          used?: boolean | null
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_receipts: {
        Row: {
          created_at: string
          customer_note: string | null
          id: string
          order_id: string
          order_number: string
          payment_method: string
          receipt_url: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_note?: string | null
          id?: string
          order_id: string
          order_number: string
          payment_method: string
          receipt_url: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_note?: string | null
          id?: string
          order_id?: string
          order_number?: string
          payment_method?: string
          receipt_url?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      phone_otps: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          otp_code: string
          phone: string
          used: boolean | null
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          otp_code: string
          phone: string
          used?: boolean | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          otp_code?: string
          phone?: string
          used?: boolean | null
        }
        Relationships: []
      }
      points_transactions: {
        Row: {
          created_at: string
          description_ar: string | null
          description_en: string | null
          id: string
          order_id: string | null
          points: number
          transaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          id?: string
          order_id?: string | null
          points: number
          transaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          id?: string
          order_id?: string | null
          points?: number
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      portfolio_items: {
        Row: {
          created_at: string
          description_ar: string | null
          description_en: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          media_files: Json | null
          media_type: string
          media_url: string
          thumbnail_url: string | null
          title_ar: string
          title_en: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          media_files?: Json | null
          media_type?: string
          media_url: string
          thumbnail_url?: string | null
          title_ar: string
          title_en: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          media_files?: Json | null
          media_type?: string
          media_url?: string
          thumbnail_url?: string | null
          title_ar?: string
          title_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          created_at: string
          id: string
          product_id: string
          rating: number
          review_text: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          rating: number
          review_text?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          rating?: number
          review_text?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          activation_instructions_ar: string | null
          activation_instructions_en: string | null
          category: string
          created_at: string
          description_ar: string | null
          description_en: string | null
          has_design_options: boolean | null
          has_pricing_options: boolean | null
          id: string
          image_url: string | null
          images: string[] | null
          in_stock: boolean | null
          name_ar: string
          name_en: string
          original_price: number | null
          price: number
          pricing_options: Json | null
          rating: number | null
          requires_email: boolean | null
          reviews_count: number | null
          subscription_duration: string | null
          updated_at: string
        }
        Insert: {
          activation_instructions_ar?: string | null
          activation_instructions_en?: string | null
          category: string
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          has_design_options?: boolean | null
          has_pricing_options?: boolean | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          in_stock?: boolean | null
          name_ar: string
          name_en: string
          original_price?: number | null
          price: number
          pricing_options?: Json | null
          rating?: number | null
          requires_email?: boolean | null
          reviews_count?: number | null
          subscription_duration?: string | null
          updated_at?: string
        }
        Update: {
          activation_instructions_ar?: string | null
          activation_instructions_en?: string | null
          category?: string
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          has_design_options?: boolean | null
          has_pricing_options?: boolean | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          in_stock?: boolean | null
          name_ar?: string
          name_en?: string
          original_price?: number | null
          price?: number
          pricing_options?: Json | null
          rating?: number | null
          requires_email?: boolean | null
          reviews_count?: number | null
          subscription_duration?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          blacklist_reason: string | null
          created_at: string
          full_name: string | null
          id: string
          is_blacklisted: boolean | null
          phone_number: string | null
          rank_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          blacklist_reason?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_blacklisted?: boolean | null
          phone_number?: string | null
          rank_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          blacklist_reason?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_blacklisted?: boolean | null
          phone_number?: string | null
          rank_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_rank_id_fkey"
            columns: ["rank_id"]
            isOneToOne: false
            referencedRelation: "ranks"
            referencedColumns: ["id"]
          },
        ]
      }
      ranks: {
        Row: {
          badge_color: string | null
          created_at: string
          description_ar: string | null
          description_en: string | null
          discount_percent: number
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name_ar: string
          name_en: string
          properties: Json | null
          updated_at: string
        }
        Insert: {
          badge_color?: string | null
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          discount_percent?: number
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name_ar: string
          name_en: string
          properties?: Json | null
          updated_at?: string
        }
        Update: {
          badge_color?: string | null
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          discount_percent?: number
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name_ar?: string
          name_en?: string
          properties?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string
          customer_avatar: string | null
          customer_name: string
          id: string
          is_approved: boolean | null
          product_name_ar: string | null
          product_name_en: string | null
          rating: number
          review_text_ar: string
          review_text_en: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_avatar?: string | null
          customer_name: string
          id?: string
          is_approved?: boolean | null
          product_name_ar?: string | null
          product_name_en?: string | null
          rating: number
          review_text_ar: string
          review_text_en?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_avatar?: string | null
          customer_name?: string
          id?: string
          is_approved?: boolean | null
          product_name_ar?: string | null
          product_name_en?: string | null
          rating?: number
          review_text_ar?: string
          review_text_en?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      streamer_packages: {
        Row: {
          category: string | null
          category_ar: string | null
          created_at: string
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name_ar: string
          name_en: string
          price: number
          updated_at: string
        }
        Insert: {
          category?: string | null
          category_ar?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name_ar: string
          name_en: string
          price?: number
          updated_at?: string
        }
        Update: {
          category?: string | null
          category_ar?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name_ar?: string
          name_en?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_carts: {
        Row: {
          abandoned_coupon_sent_at: string | null
          created_at: string
          customization: Json | null
          id: string
          product_id: string
          product_image: string | null
          product_name: string
          product_name_ar: string
          product_price: number
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          abandoned_coupon_sent_at?: string | null
          created_at?: string
          customization?: Json | null
          id?: string
          product_id: string
          product_image?: string | null
          product_name: string
          product_name_ar: string
          product_price: number
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          abandoned_coupon_sent_at?: string | null
          created_at?: string
          customization?: Json | null
          id?: string
          product_id?: string
          product_image?: string | null
          product_name?: string
          product_name_ar?: string
          product_price?: number
          quantity?: number
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
      add_loyalty_points: {
        Args: {
          p_description_ar?: string
          p_description_en?: string
          p_order_id?: string
          p_points: number
          p_user_id: string
        }
        Returns: boolean
      }
      admin_delete_user: {
        Args: { p_target_user_id: string }
        Returns: boolean
      }
      admin_send_password_reset: {
        Args: { p_target_user_email: string }
        Returns: boolean
      }
      admin_update_loyalty_points: {
        Args: {
          p_description_ar?: string
          p_description_en?: string
          p_points_change: number
          p_target_user_id: string
        }
        Returns: boolean
      }
      admin_update_user_profile: {
        Args: {
          p_avatar_url?: string
          p_full_name?: string
          p_target_user_id: string
        }
        Returns: boolean
      }
      assign_user_rank: {
        Args: { p_rank_id: string; p_target_user_id: string }
        Returns: boolean
      }
      calculate_points_from_amount: {
        Args: { amount: number }
        Returns: number
      }
      check_order_rate_limit: { Args: { p_phone: string }; Returns: boolean }
      cleanup_expired_phone_otps: { Args: never; Returns: undefined }
      create_personal_coupon: {
        Args: {
          p_code: string
          p_discount_percent: number
          p_expires_at?: string
          p_target_user_id: string
        }
        Returns: string
      }
      generate_order_number: { Args: never; Returns: string }
      generate_password_reset_otp: {
        Args: { p_user_email: string }
        Returns: string
      }
      get_all_users_with_roles: {
        Args: never
        Returns: {
          created_at: string
          email: string
          is_admin: boolean
          user_id: string
        }[]
      }
      get_product_rating: {
        Args: { p_product_id: string }
        Returns: {
          avg_rating: number
          reviews_count: number
        }[]
      }
      get_user_details_for_admin: {
        Args: { p_user_id: string }
        Returns: {
          auth_phone: string
          avatar_url: string
          blacklist_reason: string
          created_at: string
          email: string
          full_name: string
          is_admin: boolean
          is_blacklisted: boolean
          is_owner: boolean
          loyalty_points: number
          total_earned: number
          total_redeemed: number
          user_id: string
        }[]
      }
      get_user_personal_coupons: {
        Args: { p_user_id: string }
        Returns: {
          code: string
          created_at: string
          discount_percent: number
          expires_at: string
          id: string
          is_active: boolean
        }[]
      }
      get_user_points: { Args: { p_user_id: string }; Returns: number }
      get_user_rank_discount: {
        Args: { p_user_id: string }
        Returns: {
          discount_percent: number
          rank_name_ar: string
          rank_name_en: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_owner: { Args: { _user_id: string }; Returns: boolean }
      redeem_loyalty_points: {
        Args: {
          p_description_ar?: string
          p_description_en?: string
          p_points: number
          p_user_id: string
        }
        Returns: boolean
      }
      search_users_for_admin: {
        Args: { p_search_term?: string }
        Returns: {
          avatar_url: string
          created_at: string
          email: string
          full_name: string
          is_admin: boolean
          is_blacklisted: boolean
          is_owner: boolean
          loyalty_points: number
          user_id: string
        }[]
      }
      set_admin_role: {
        Args: { _make_admin: boolean; _target_user_id: string }
        Returns: boolean
      }
      set_user_blacklist: {
        Args: {
          p_is_blacklisted: boolean
          p_reason?: string
          p_target_user_id: string
        }
        Returns: boolean
      }
      validate_coupon:
        | {
            Args: { coupon_code: string }
            Returns: {
              discount_percent: number
              is_valid: boolean
            }[]
          }
        | {
            Args: { coupon_code: string; p_user_id?: string }
            Returns: {
              discount_percent: number
              is_valid: boolean
            }[]
          }
      verify_password_reset_otp: {
        Args: { p_otp: string; p_user_email: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "owner"
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
      app_role: ["admin", "user", "owner"],
    },
  },
} as const
