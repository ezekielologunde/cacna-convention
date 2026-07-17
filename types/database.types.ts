export type Database = {
  public: {
    Tables: {
      convention_editions: {
        Row: {
          id: string;
          year: number;
          theme: string;
          starts_on: string;
          ends_on: string;
          venue_name: string;
          venue_address: string;
          status: "upcoming" | "current" | "past";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          year: number;
          theme: string;
          starts_on: string;
          ends_on: string;
          venue_name: string;
          venue_address: string;
          status?: "upcoming" | "current" | "past";
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["convention_editions"]["Insert"]>;
        Relationships: [];
      };
      admin_profiles: {
        Row: {
          id: string;
          full_name: string;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["admin_profiles"]["Insert"]>;
        Relationships: [];
      };
      schedule_sessions: {
        Row: {
          id: string;
          edition_id: string;
          day_date: string;
          starts_at: string;
          ends_at: string;
          title: string;
          minister_name: string | null;
          minister_title: string | null;
          track: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          edition_id: string;
          day_date: string;
          starts_at: string;
          ends_at: string;
          title: string;
          minister_name?: string | null;
          minister_title?: string | null;
          track?: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["schedule_sessions"]["Insert"]>;
        Relationships: [];
      };
      pricing_tiers: {
        Row: {
          id: string;
          edition_id: string;
          category: "adult" | "young_adult" | "child";
          price_cents: number;
          starts_on: string;
          ends_on: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          edition_id: string;
          category: "adult" | "young_adult" | "child";
          price_cents: number;
          starts_on: string;
          ends_on: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["pricing_tiers"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};
