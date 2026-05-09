export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          phone?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          name?: string;
          phone?: string | null;
          avatar_url?: string | null;
        };
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          line1: string;
          line2: string | null;
          city: string;
          pincode: string;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          label?: string;
          line1: string;
          line2?: string | null;
          city: string;
          pincode: string;
          is_default?: boolean;
        };
        Update: {
          label?: string;
          line1?: string;
          line2?: string | null;
          city?: string;
          pincode?: string;
          is_default?: boolean;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          image_url: string;
          sort_order: number;
        };
        Insert: {
          id: string;
          name: string;
          image_url: string;
          sort_order?: number;
        };
        Update: {
          name?: string;
          image_url?: string;
          sort_order?: number;
        };
      };
      menu_items: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          image_url: string;
          category_id: string | null;
          is_veg: boolean;
          is_popular: boolean;
          rating: number | null;
          prep_time: string | null;
          tag: string | null;
          is_available: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          description?: string | null;
          price: number;
          image_url: string;
          category_id?: string | null;
          is_veg?: boolean;
          is_popular?: boolean;
          rating?: number | null;
          prep_time?: string | null;
          tag?: string | null;
          is_available?: boolean;
        };
        Update: {
          name?: string;
          description?: string | null;
          price?: number;
          image_url?: string;
          category_id?: string | null;
          is_veg?: boolean;
          is_popular?: boolean;
          rating?: number | null;
          prep_time?: string | null;
          tag?: string | null;
          is_available?: boolean;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          status: OrderStatus;
          address_snapshot: Record<string, unknown> | null;
          subtotal: number;
          delivery_fee: number;
          taxes: number;
          grand_total: number;
          payment_method: string;
          payment_status: string;
          placed_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          status?: OrderStatus;
          address_snapshot?: Record<string, unknown> | null;
          subtotal: number;
          delivery_fee: number;
          taxes: number;
          grand_total: number;
          payment_method?: string;
          payment_status?: string;
        };
        Update: {
          status?: OrderStatus;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          item_id: string | null;
          name: string;
          price: number;
          image_url: string | null;
          quantity: number;
          is_veg: boolean | null;
        };
        Insert: {
          order_id: string;
          item_id?: string | null;
          name: string;
          price: number;
          image_url?: string | null;
          quantity: number;
          is_veg?: boolean | null;
        };
        Update: never;
      };
    };
  };
}

// Convenience row types
export type Profile     = Database['public']['Tables']['profiles']['Row'];
export type Address     = Database['public']['Tables']['addresses']['Row'];
export type Category    = Database['public']['Tables']['categories']['Row'];
export type DbMenuItem  = Database['public']['Tables']['menu_items']['Row'];
export type Order       = Database['public']['Tables']['orders']['Row'];
export type OrderItem   = Database['public']['Tables']['order_items']['Row'];
