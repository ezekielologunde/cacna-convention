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
      };
    };
  };
};
